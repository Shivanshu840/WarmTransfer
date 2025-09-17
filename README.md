# Warm Transfer Application

A comprehensive warm transfer system that enables seamless call handoffs between agents with AI-powered context sharing using LiveKit, LLM integration, and optional Twilio support.

## Setup Instructions

### Prerequisites and API Keys

Before running the application, obtain API keys from the following services:

#### Required Services

**1. LiveKit (Required for real-time audio)**
- Sign up at [livekit.io](https://livekit.io)
- Create a new project
- Navigate to Settings → Keys
- Copy your API Key and API Secret
- Note your WebSocket URL (typically starts with `wss://`)

**2. LLM Provider (Required for AI summaries)**

Choose one of these options:

**Option A: Groq (Recommended for speed)**
- Create account at [console.groq.com](https://console.groq.com)
- Go to API Keys section
- Generate new API key
- Copy the key (starts with `gsk_`)

**Option B: OpenAI**
- Create account at [platform.openai.com](https://platform.openai.com)
- Navigate to API Keys
- Create new secret key
- Copy the key (starts with `sk-`)

#### Optional Services

**3. Twilio (Optional - for external phone transfers)**
- Sign up at [twilio.com](https://twilio.com)
- Get Account SID from Console Dashboard
- Get Auth Token from Console Dashboard
- Purchase or get a trial phone number
- Verify destination phone numbers (required for trial accounts)

### Installation

**1. Clone Repository**
```bash
git clone <repository-url>
cd warm-transfer-app
```

**2. Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

**3. Configure Backend Environment (.env)**
```env
# LiveKit Configuration (Required)
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here
LIVEKIT_WS_URL=ws://localhost:7880
LIVEKIT_HTTP_URL=http://localhost:7880

# LLM Configuration (Choose one)
# Groq API Key (Recommended)
GROQ_API_KEY=your_groq_api_key_here

# OR OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+15551234567

# Server Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

**4. Web Client Setup**
```bash
cd web

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

**5. Configure Web Client Environment (.env.local)**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# LiveKit Configuration
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
```

**6. LiveKit Server Setup**

You need to run a LiveKit server locally for development:

**Option A: Docker (Recommended)**
```bash
docker run --rm \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  livekit/livekit-server \
  --dev
```

**Option B: Binary Installation**
1. Download from [github.com/livekit/livekit/releases](https://github.com/livekit/livekit/releases)
2. Extract and run: `./livekit-server --dev`

## How to Run Services

### Start All Services (Required Order)

**1. Start LiveKit Server (First)**
```bash
# In a separate terminal
docker run --rm \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  livekit/livekit-server \
  --dev
```
Leave this running. You should see output indicating the server is ready.

**2. Start Backend API Server (Second)**
```bash
# In backend directory
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```

You should see:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**3. Start Web Application (Third)**
```bash
# In web directory
cd web
npm run dev
```

You should see:
```
Ready - started server on 0.0.0.0:3000
```

### Access Points

- **Customer/Agent A Interface:** http://localhost:3000
- **Agent B Dashboard:** http://localhost:3000/agent-b
- **Backend API:** http://localhost:8000
- **API Health Check:** http://localhost:8000/api/health

### Verification Steps

1. **Check Backend Health:**
   ```bash
   curl http://localhost:8000/api/health
   ```
   Should return status "healthy"

2. **Test Web Application:**
   - Open http://localhost:3000
   - Should see "Call Transfer System" interface

3. **Test Agent B Dashboard:**
   - Open http://localhost:3000/agent-b
   - Should see "Agent B Dashboard"

## Detailed Warm Transfer Workflow

### Overview

The warm transfer process allows Agent A to seamlessly hand off a customer call to Agent B with full context preservation. Here's how it works step by step:

### Phase 1: Initial Customer Contact

**1. Customer Initiates Call**
- Customer opens http://localhost:3000
- Enters their name in the call interface
- Clicks "Start New Call"
- System creates a unique call session and LiveKit room

**2. Agent A Joins Automatically**
- Backend automatically assigns Agent A to the call
- Agent A interface shows connected status
- Voice connection established via LiveKit WebRTC

**3. Call Context Begins**
- Call session ID created for tracking
- Initial context logged: "Call started with customer [name]"

### Phase 2: Conversation and Context Capture

**4. Agent A Captures Real-Time Context**
- Agent A uses the "Add Call Context" section during conversation
- Examples of context input:
  - "Customer has billing issue with payment declined"
  - "Technical problem - React app not loading, 404 error"
  - "Refund request for order #12345, damaged item"
- Each context entry is timestamped and stored
- Context appears in local history for Agent A to review

**5. Context Storage**
- All context sent to backend via `/api/add-context` endpoint
- Backend stores context with session ID and speaker identification
- Context used later for AI summary generation

### Phase 3: Transfer Decision and Initiation

**6. Agent A Decides to Transfer**
- Agent A determines customer needs specialized help
- In Transfer Panel, Agent A enters Agent B name (e.g., "Random")
- Clicks "Initiate Transfer"

**7. Backend Processing and AI Summary Generation**
- Backend receives transfer request with session ID and Agent B ID
- **LLM GENERATES CONTEXT HERE:** Backend calls `/api/initiate-transfer` endpoint
- System retrieves all stored context from the call session
- LLM (Groq/OpenAI) processes the context using this prompt:
  ```
  "You are an AI assistant that creates concise call summaries for warm transfers. 
  Summarize the key points, customer needs, and context that would be helpful 
  for the next agent."
  ```
- AI generates comprehensive call summary from all captured context
- Generated summary stored in call session data
- System creates private "transfer room" for agent briefing
- Transfer notification created for Agent B

**8. Transfer Room Creation**
- Unique transfer room created: `transfer_[session]_[random]`
- Tokens generated for both agents to join transfer room
- Agent A receives transfer room credentials

### Phase 4: Agent Briefing Phase

**9. Agent B Notification**
- Agent B dashboard (http://localhost:3000/agent-b) polls for notifications every 2 seconds
- System displays incoming transfer notification with orange alert
- Notification includes:
  - Transfer room ID
  - Session information
  - Timestamp
  - "Accept Transfer" button

**10. Agents Join Transfer Room**
- Agent B clicks "Accept Transfer" and joins private transfer room
- Agent A also joins the same transfer room
- Both agents now in private conversation (customer cannot hear)

**11. Context Sharing**
- AI-generated call summary displayed to both agents
- Summary includes:
  - Customer name
  - Main issues discussed
  - Specific problems mentioned
  - Current status and next steps needed
- Agent A provides additional verbal context if needed

### Phase 5: Transfer Completion

**12. Agent A Completes Transfer**
- When briefing is complete, Agent A clicks "Complete Transfer"
- Backend generates token for Agent B to join original customer room
- Completion notification sent to Agent B with customer room details

**13. Automatic Agent B Connection**
- Agent B automatically connects to customer room
- Agent B interface shows "Customer Call Active" status
- Voice connection established between Agent B and customer
- Call timer starts for Agent B

**14. Agent A Graceful Exit**
- Agent A can leave customer room (customer continues with Agent B)
- Original call session marked as "transferred"
- Agent A's work is complete

### Phase 6: Continued Customer Support

**15. Agent B Takes Over**
- Agent B now handles customer conversation
- Full context available from AI summary
- Customer experiences seamless transition
- Agent B can add additional context if needed

**16. Call Resolution**
- Agent B resolves customer issue
- Agent B can end call when complete, or
- Customer can end call themselves
- Session marked as completed

### Phase 7: Optional External Transfer (Twilio)

**17. Transfer to External Phone (Optional)**
- If needed, Agent A or B can transfer to external phone number
- Enter phone number in "Transfer to Phone" section
- Click "Transfer via Twilio"
- System calls external number and plays AI-generated summary

### Technical Flow Details

**API Calls During Transfer:**
1. `POST /api/create-call` - Create initial session
2. `POST /api/add-context` - Add conversation context (multiple times)
3. `POST /api/initiate-transfer` - Start transfer process
4. `GET /api/notifications/{agent_id}` - Agent B polls for notifications
5. `POST /api/complete-transfer` - Complete the handoff
6. `POST /api/agent-exit-room` - Agent A leaves customer room

**LiveKit Room Flow:**
1. **Customer Room:** `call_[random]` - Customer + Agent A initially
2. **Transfer Room:** `transfer_[session]_[random]` - Agent A + Agent B briefing  
3. **Customer Room:** `call_[random]` - Customer + Agent B finally

**Data Flow:**
- Context stored in backend memory with session ID
- AI processes context into readable summary
- Notifications stored per agent ID for polling
- Session state tracked throughout transfer process

### Error Handling

**Common Scenarios:**
- **Agent B Offline:** Transfer notification persists until Agent B comes online
- **Connection Loss:** Participants can rejoin using same tokens
- **Transfer Timeout:** Transfer can be retried with same context
- **Customer Disconnects:** Both agents notified, session ended

**Recovery Mechanisms:**
- Session state preserved in backend memory
- Room tokens remain valid for reconnection
- Context preserved even if transfer fails
- Manual reset available via Agent B "Reset" button

This workflow ensures customers receive uninterrupted service while agents maintain complete context throughout the handoff process.