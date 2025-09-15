from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import logging
from typing import Dict, List, Optional
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

from livekit import rtc
import livekit_api
from livekit_api import AccessToken, VideoGrants, RoomService, CreateRoomRequest, ListParticipantsRequest

import openai
from groq import Groq

try:
    from twilio.rest import Client as TwilioClient
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Warm Transfer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransferManager:
    def __init__(self):
        self.active_calls: Dict[str, dict] = {}
        self.agents: Dict[str, dict] = {}
        self.transfer_sessions: Dict[str, dict] = {}
        
    def create_call_session(self, caller_id: str, room_name: str) -> str:
        session_id = str(uuid.uuid4())
        self.active_calls[session_id] = {
            "caller_id": caller_id,
            "room_name": room_name,
            "agent_a": None,
            "agent_b": None,
            "status": "active",
            "created_at": datetime.now(),
            "call_summary": "",
            "transfer_room": None
        }
        return session_id
    
    def assign_agent_a(self, session_id: str, agent_id: str):
        if session_id in self.active_calls:
            self.active_calls[session_id]["agent_a"] = agent_id
            
    def initiate_transfer(self, session_id: str, agent_b_id: str) -> str:
        if session_id not in self.active_calls:
            raise ValueError("Session not found")
            
        transfer_room = f"transfer_{session_id}_{uuid.uuid4().hex[:8]}"
        self.active_calls[session_id]["agent_b"] = agent_b_id
        self.active_calls[session_id]["transfer_room"] = transfer_room
        self.active_calls[session_id]["status"] = "transferring"
        
        return transfer_room

transfer_manager = TransferManager()

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
LIVEKIT_WS_URL = os.getenv("LIVEKIT_WS_URL", "ws://localhost:7880")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)

if TWILIO_AVAILABLE and TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    twilio_client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

class LiveKitService:
    def __init__(self):
        self.room_service = RoomService(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, url=LIVEKIT_WS_URL)
        
    async def create_room(self, room_name: str) -> dict:
        try:
            room = await self.room_service.create_room(
                CreateRoomRequest(name=room_name)
            )
            return {"room_name": room.name, "sid": room.sid}
        except Exception as e:
            logger.error(f"Failed to create room: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create room: {str(e)}")
    
    def generate_token(self, room_name: str, participant_name: str) -> str:
        token = AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        token.with_identity(participant_name)
        token.with_name(participant_name)
        token.with_grants(VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True,
        ))
        return token.to_jwt()
    
    async def list_participants(self, room_name: str) -> List[dict]:
        try:
            participants = await self.room_service.list_participants(
                ListParticipantsRequest(room=room_name)
            )
            return [{"identity": p.identity, "name": p.name} for p in participants]
        except Exception as e:
            logger.error(f"Failed to list participants: {e}")
            return []

livekit_service = LiveKitService()

class LLMService:
    def __init__(self):
        self.call_contexts: Dict[str, List[str]] = {}
    
    def add_context(self, session_id: str, message: str):
        if session_id not in self.call_contexts:
            self.call_contexts[session_id] = []
        self.call_contexts[session_id].append(message)
    
    async def generate_call_summary(self, session_id: str) -> str:
        if session_id not in self.call_contexts:
            return "No call context available"
        
        context = "\n".join(self.call_contexts[session_id])
        
        try:
            if GROQ_API_KEY:
                response = groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an AI assistant that creates concise call summaries for warm transfers. Summarize the key points, customer needs, and context that would be helpful for the next agent."
                        },
                        {
                            "role": "user",
                            "content": f"Please summarize this call context for a warm transfer:\n\n{context}"
                        }
                    ],
                    max_tokens=200,
                    temperature=0.3
                )
                return response.choices[0].message.content
            
            elif OPENAI_API_KEY:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an AI assistant that creates concise call summaries for warm transfers. Summarize the key points, customer needs, and context that would be helpful for the next agent."
                        },
                        {
                            "role": "user",
                            "content": f"Please summarize this call context for a warm transfer:\n\n{context}"
                        }
                    ],
                    max_tokens=200,
                    temperature=0.3
                )
                return response.choices[0].message.content
            
            else:
                return "LLM service not configured. Please add API keys."
                
        except Exception as e:
            logger.error(f"Failed to generate summary: {e}")
            return f"Failed to generate summary: {str(e)}"

llm_service = LLMService()

@app.get("/")
async def root():
    return {"message": "Warm Transfer API is running"}

@app.post("/api/create-call")
async def create_call(request: dict):
    try:
        caller_id = request.get("caller_id", f"caller_{uuid.uuid4().hex[:8]}")
        room_name = f"call_{uuid.uuid4().hex[:8]}"
        
        room_info = await livekit_service.create_room(room_name)
        
        session_id = transfer_manager.create_call_session(caller_id, room_name)
        
        caller_token = livekit_service.generate_token(room_name, caller_id)
        agent_a_id = f"agent_a_{uuid.uuid4().hex[:8]}"
        agent_token = livekit_service.generate_token(room_name, agent_a_id)
        
        transfer_manager.assign_agent_a(session_id, agent_a_id)
        
        return {
            "session_id": session_id,
            "room_name": room_name,
            "caller_token": caller_token,
            "agent_token": agent_token,
            "agent_id": agent_a_id,
            "ws_url": LIVEKIT_WS_URL
        }
        
    except Exception as e:
        logger.error(f"Failed to create call: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/initiate-transfer")
async def initiate_transfer(request: dict):
    try:
        session_id = request.get("session_id")
        agent_b_id = request.get("agent_b_id", f"agent_b_{uuid.uuid4().hex[:8]}")
        
        if not session_id or session_id not in transfer_manager.active_calls:
            raise HTTPException(status_code=404, detail="Call session not found")
        
        summary = await llm_service.generate_call_summary(session_id)
        transfer_manager.active_calls[session_id]["call_summary"] = summary
        
        transfer_room = transfer_manager.initiate_transfer(session_id, agent_b_id)
        
        await livekit_service.create_room(transfer_room)
        
        agent_a_transfer_token = livekit_service.generate_token(
            transfer_room, 
            transfer_manager.active_calls[session_id]["agent_a"]
        )
        agent_b_transfer_token = livekit_service.generate_token(transfer_room, agent_b_id)
        
        return {
            "transfer_room": transfer_room,
            "agent_a_transfer_token": agent_a_transfer_token,
            "agent_b_transfer_token": agent_b_transfer_token,
            "call_summary": summary,
            "ws_url": LIVEKIT_WS_URL
        }
        
    except Exception as e:
        logger.error(f"Failed to initiate transfer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/complete-transfer")
async def complete_transfer(request: dict):
    try:
        session_id = request.get("session_id")
        
        if not session_id or session_id not in transfer_manager.active_calls:
            raise HTTPException(status_code=404, detail="Call session not found")
        
        call_session = transfer_manager.active_calls[session_id]
        original_room = call_session["room_name"]
        agent_b_id = call_session["agent_b"]
        
        agent_b_original_token = livekit_service.generate_token(original_room, agent_b_id)
        
        transfer_manager.active_calls[session_id]["status"] = "transferred"
        
        return {
            "agent_b_original_token": agent_b_original_token,
            "original_room": original_room,
            "ws_url": LIVEKIT_WS_URL,
            "message": "Transfer completed successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to complete transfer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/add-context")
async def add_context(request: dict):
    try:
        session_id = request.get("session_id")
        message = request.get("message")
        
        if not session_id or not message:
            raise HTTPException(status_code=400, detail="Missing session_id or message")
        
        llm_service.add_context(session_id, message)
        
        return {"message": "Context added successfully"}
        
    except Exception as e:
        logger.error(f"Failed to add context: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/call-status/{session_id}")
async def get_call_status(session_id: str):
    if session_id not in transfer_manager.active_calls:
        raise HTTPException(status_code=404, detail="Call session not found")
    
    return transfer_manager.active_calls[session_id]

@app.post("/api/twilio-transfer")
async def twilio_transfer(request: dict):
    if not TWILIO_AVAILABLE or not twilio_client:
        raise HTTPException(status_code=501, detail="Twilio integration not configured")
    
    try:
        session_id = request.get("session_id")
        phone_number = request.get("phone_number")
        
        if not session_id or session_id not in transfer_manager.active_calls:
            raise HTTPException(status_code=404, detail="Call session not found")
        
        if not phone_number:
            raise HTTPException(status_code=400, detail="Phone number required")
        
        summary = await llm_service.generate_call_summary(session_id)
        
        call = twilio_client.calls.create(
            to=phone_number,
            from_=TWILIO_PHONE_NUMBER,
            twiml=f'<Response><Say>Incoming warm transfer. Call summary: {summary}</Say><Dial>{phone_number}</Dial></Response>'
        )
        
        return {
            "twilio_call_sid": call.sid,
            "call_summary": summary,
            "message": "Twilio transfer initiated"
        }
        
    except Exception as e:
        logger.error(f"Failed to initiate Twilio transfer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
