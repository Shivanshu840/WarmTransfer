"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from "lucide-react"
import { apiService } from "../lib/api"
import type { CallSession, TransferState } from "../types"

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

  // Timer effect
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

  const startCall = useCallback(async () => {
    if (!callerName.trim()) {
      alert("Please enter your name")
      return
    }

    setIsConnecting(true)
    try {
      const response: CallSession = await apiService.createCall({
        caller_id: callerName.trim(),
      })

      setCallData(response)
      onCallStart(response)
      setIsConnected(true)
      setCallDuration(0)
      onTransferStateChange("idle")

      if (response.session_id) {
        await apiService.addContext(response.session_id, `Customer ${callerName} connected to the call`)
      }
    } catch (error) {
      console.error("Failed to start call:", error)
      alert("Failed to start call. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }, [callerName, onCallStart, onTransferStateChange])

  const endCall = useCallback(() => {
    setIsConnected(false)
    setCallData(null)
    setCallDuration(0)
    onCallStart(null)
    onTransferStateChange("idle")
    onCallEnd?.()
  }, [onCallStart, onTransferStateChange, onCallEnd])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
    console.log(`Microphone ${!isMuted ? "muted" : "unmuted"}`)
  }, [isMuted])

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start a New Call</h3>
          <p className="text-gray-600 dark:text-gray-300">Enter your name to connect with Agent A</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            value={callerName}
            onChange={(e) => setCallerName(e.target.value)}
            className="text-center"
          />
          <Button onClick={startCall} disabled={isConnecting || !callerName.trim()} className="w-full" size="lg">
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Start Call
              </>
            )}
          </Button>
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
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connected to Agent A</h3>
        <p className="text-gray-600 dark:text-gray-300">Room: {callData?.room_name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Duration: {formatDuration(callDuration)}</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Volume2 className="w-6 h-6 text-green-600 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Audio Connection Active</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">WebSocket URL: {callData?.ws_url}</div>
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
