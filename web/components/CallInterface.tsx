"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Card } from "./ui/Card"
import { Phone, PhoneOff, Mic, MicOff, Volume2, Copy, Users, MessageSquare, Send } from "lucide-react"
import { apiService } from "../lib/api"
import { AudioInterface } from "./AudioInterace"
import type { CallSession, TransferState } from "../types"
import { Room, Track, type LocalAudioTrack, createLocalAudioTrack } from "livekit-client"

interface CallInterfaceProps {
  onCallStart: (callData: CallSession | null) => void
  onTransferStateChange: (state: TransferState) => void
  onCallEnd?: () => void
}

export function CallInterface({ onCallStart, onTransferStateChange, onCallEnd }: CallInterfaceProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [callData, setCallData] = useState<CallSession | null>(null)
  const [callerName, setCallerName] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [roomIdToJoin, setRoomIdToJoin] = useState("")
  
  // Context tracking states
  const [contextInput, setContextInput] = useState("")
  const [contextHistory, setContextHistory] = useState<string[]>([])
  const [isAddingContext, setIsAddingContext] = useState(false)

  const [room, setRoom] = useState<Room | null>(null)
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null)
  const roomRef = useRef<Room | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isConnected])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const addCallContext = useCallback(async () => {
    if (!callData?.session_id || !contextInput.trim()) {
      return
    }

    setIsAddingContext(true)
    try {
      await apiService.addContext(
        callData.session_id,
        contextInput.trim(),
        "Agent A"
      )
      
      // Add to local context history
      setContextHistory(prev => [...prev, `${new Date().toLocaleTimeString()}: ${contextInput.trim()}`])
      setContextInput("")
      
      console.log("[v0] Context added successfully:", contextInput.trim())
    } catch (error) {
      console.error("[v0] Failed to add context:", error)
      alert("Failed to add context. Please try again.")
    } finally {
      setIsAddingContext(false)
    }
  }, [callData?.session_id, contextInput])

  const handleContextKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addCallContext()
    }
  }

  const startCall = useCallback(async () => {
    if (!callerName.trim()) {
      alert("Please enter your name")
      return
    }

    setIsConnecting(true)
    try {
      console.log("[v0] Creating call via backend API...")
      const response = await apiService.createCall({
        caller_id: callerName.trim(),
      })

      console.log("[v0] Backend response:", response)

      const newRoom = new Room()
      roomRef.current = newRoom

      // Create and publish audio track
      const track = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      })

      const livekitUrl = response.ws_url

      await newRoom.connect(livekitUrl, response.caller_token, {
        autoSubscribe: true,
      })

      await newRoom.localParticipant.publishTrack(track, {
        name: "microphone",
        source: Track.Source.Microphone,
      })

      setRoom(newRoom)
      setAudioTrack(track)
      setCallData(response)
      onCallStart(response)
      setIsConnected(true)
      setCallDuration(0)
      setContextHistory([]) // Reset context history for new call
      onTransferStateChange("idle")

      try {
        await apiService.addContext(
          response.session_id,
          `Call started with customer: ${callerName.trim()}. Customer has joined the room and is ready to speak with Agent A.`,
          "System",
        )
      } catch (contextError) {
        console.warn("[v0] Failed to add call start context:", contextError)
      }

      console.log("[v0] Successfully connected to LiveKit room:", response.room_name)
    } catch (error) {
      console.error("[v0] Failed to start call:", error)
      alert(
        `Failed to start call: ${error instanceof Error ? error.message : "Unknown error"}. Please check your backend server is running on port 8000.`,
      )
    } finally {
      setIsConnecting(false)
    }
  }, [callerName, onCallStart, onTransferStateChange])

  const copyRoomId = useCallback(async () => {
    if (callData?.room_name) {
      try {
        await navigator.clipboard.writeText(callData.room_name)
        alert("Room ID copied to clipboard!")
      } catch (error) {
        console.error("[v0] Failed to copy room ID:", error)
        alert(`Room ID: ${callData.room_name}`)
      }
    }
  }, [callData?.room_name])

  const joinRoom = useCallback(async () => {
    if (!callerName.trim()) {
      alert("Please enter your name")
      return
    }
    if (!roomIdToJoin.trim()) {
      alert("Please enter a room ID")
      return
    }

    setIsConnecting(true)
    try {
      console.log("[v0] Joining existing room:", roomIdToJoin)

      // Create a call session for the existing room
      const response = await apiService.createCall({
        caller_id: callerName.trim(),
        room_name: roomIdToJoin.trim(), // Join specific room
      })

      const newRoom = new Room()
      roomRef.current = newRoom

      // Create and publish audio track
      const track = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      })

      const livekitUrl = response.ws_url

      await newRoom.connect(livekitUrl, response.caller_token, {
        autoSubscribe: true,
      })

      await newRoom.localParticipant.publishTrack(track, {
        name: "microphone",
        source: Track.Source.Microphone,
      })

      setRoom(newRoom)
      setAudioTrack(track)
      setCallData(response)
      onCallStart(response)
      setIsConnected(true)
      setCallDuration(0)
      setContextHistory([]) // Reset context history
      onTransferStateChange("idle")
      setShowJoinRoom(false)
      setRoomIdToJoin("")

      try {
        await apiService.addContext(
          response.session_id,
          `${callerName.trim()} has joined existing room ${roomIdToJoin.trim()}. Customer is now connected and ready to continue the conversation.`,
          "System",
        )
      } catch (contextError) {
        console.warn("[v0] Failed to add join room context:", contextError)
      }

      console.log("[v0] Successfully joined LiveKit room:", roomIdToJoin)
    } catch (error) {
      console.error("[v0] Failed to join room:", error)
      alert(
        `Failed to join room: ${error instanceof Error ? error.message : "Unknown error"}. Please check the room ID and try again.`,
      )
    } finally {
      setIsConnecting(false)
    }
  }, [callerName, roomIdToJoin, onCallStart, onTransferStateChange])

  const endCall = useCallback(async () => {
    try {
      if (callData?.session_id) {
        try {
          await apiService.addContext(
            callData.session_id,
            `Call ended by customer ${callerName}. Customer has disconnected from the room.`,
            "System",
          )
        } catch (contextError) {
          console.warn("[v0] Failed to add call end context:", contextError)
        }

        await apiService.endCall(callData.session_id)
      }

      if (roomRef.current) {
        await roomRef.current.disconnect()
        roomRef.current = null
      }

      if (audioTrack) {
        audioTrack.stop()
        setAudioTrack(null)
      }

      setRoom(null)
    } catch (error) {
      console.error("[v0] Error ending call:", error)
    }

    setIsConnected(false)
    setCallData(null)
    setCallDuration(0)
    setContextHistory([])
    onCallStart(null)
    onTransferStateChange("idle")
    onCallEnd?.()
  }, [callData, audioTrack, onCallStart, onTransferStateChange, onCallEnd, callerName])

  const toggleMute = useCallback(async () => {
    if (audioTrack) {
      if (isMuted) {
        await audioTrack.unmute()
      } else {
        await audioTrack.mute()
      }
    }
    setIsMuted((prev) => !prev)
    console.log(`[v0] Microphone ${!isMuted ? "muted" : "unmuted"}`)
  }, [isMuted, audioTrack])

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {showJoinRoom ? "Join Existing Call" : "Start a New Call"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {showJoinRoom ? "Enter the room ID to join an ongoing call" : "Enter your name to connect with Agent A"}
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            value={callerName}
            onChange={(e) => setCallerName(e.target.value)}
            className="text-center"
          />

          {showJoinRoom && (
            <Input
              type="text"
              placeholder="Enter room ID (e.g., call_3f85d276)"
              value={roomIdToJoin}
              onChange={(e) => setRoomIdToJoin(e.target.value)}
              className="text-center"
            />
          )}

          <div className="space-y-2">
            {showJoinRoom ? (
              <Button
                onClick={joinRoom}
                disabled={isConnecting || !callerName.trim() || !roomIdToJoin.trim()}
                className="w-full"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Join Call
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={startCall} disabled={isConnecting || !callerName.trim()} className="w-full" size="lg">
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Start New Call
                  </>
                )}
              </Button>
            )}

            <Button onClick={() => setShowJoinRoom(!showJoinRoom)} variant="outline" className="w-full">
              {showJoinRoom ? "Start New Call Instead" : "Join Existing Call"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connected to LiveKit Room</h3>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4 max-w-md mx-auto">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Share this Room ID:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
              {callData?.room_name}
            </code>
            <Button onClick={copyRoomId} size="sm" variant="outline">
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">Duration: {formatDuration(callDuration)}</p>
      </div>

      {/* Context Input Section - NEW */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <h4 className="font-medium text-blue-900 dark:text-blue-100">Add Call Context</h4>
          <span className="text-xs text-blue-700 dark:text-blue-300 ml-auto">For Agent B</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Customer has billing issue with payment declined, needs refund for order #12345..."
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              onKeyPress={handleContextKeyPress}
              className="flex-1"
              disabled={isAddingContext}
            />
            <Button 
              onClick={addCallContext}
              disabled={!contextInput.trim() || isAddingContext}
              size="sm"
            >
              {isAddingContext ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </Button>
          </div>
          
          {contextHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded p-2 max-h-20 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-1">Context added:</p>
              {contextHistory.slice(-3).map((context, index) => (
                <p key={index} className="text-xs text-gray-700 dark:text-gray-300 mb-1">{context}</p>
              ))}
            </div>
          )}
        </div>
        
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          💡 Add customer issues, requests, and important details during the call for better transfer context
        </p>
      </Card>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Volume2 className="w-6 h-6 text-green-600 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Voice Connection Active</span>
        </div>
        <AudioInterface room={room} />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Server: {callData?.ws_url}</div>
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={toggleMute} variant={isMuted ? "destructive" : "outline"} size="lg">
          {isMuted ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Unmute
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Mute
            </>
          )}
        </Button>

        <Button onClick={endCall} variant="destructive" size="lg">
          <PhoneOff className="w-4 h-4 mr-2" />
          End Call
        </Button>
      </div>
    </div>
  )
}