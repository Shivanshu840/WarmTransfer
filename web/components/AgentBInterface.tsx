"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Card } from "./ui/Card"
import {
  Users,
  ArrowRight,
  Bell,
  CheckCircle,
  AlertCircle,
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
} from "lucide-react"
import { apiService } from "../lib/api"
import { AudioInterface } from "./AudioInterace"
import { Room, Track, type LocalAudioTrack, createLocalAudioTrack } from "livekit-client"

interface AgentBInterfaceProps {
  onJoinTransfer: (transferRoom: string, agentBToken: string) => void
  onJoinCustomerCall: (originalRoom: string, customerToken: string) => void
}

interface TransferNotification {
  type: string
  session_id: string
  agent_b_id: string
  transfer_room: string
  agent_b_token: string
  timestamp: string
  message: string
  original_room?: string
  customer_token?: string
}

export function AgentBInterface({ onJoinTransfer, onJoinCustomerCall }: AgentBInterfaceProps) {
  const [transferRoom, setTransferRoom] = useState("")
  const [agentBToken, setAgentBToken] = useState("")
  const [originalRoom, setOriginalRoom] = useState("")
  const [customerToken, setCustomerToken] = useState("")
  const [agentId, setAgentId] = useState("Random") // Default to "Random" to match your test
  const [notifications, setNotifications] = useState<TransferNotification[]>([])
  const [isPolling, setIsPolling] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"listening" | "in_transfer" | "with_customer">("listening")
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null)
  const [pollError, setPollError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [customerRoom, setCustomerRoom] = useState<Room | null>(null)
  const [customerAudioTrack, setCustomerAudioTrack] = useState<LocalAudioTrack | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  const handleDismissNotification = (sessionId: string) => {
    setNotifications((prev) => prev.filter((n) => n.session_id !== sessionId))
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (connectionStatus === "with_customer") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      setCallDuration(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [connectionStatus])

  useEffect(() => {
    let interval: NodeJS.Timeout

    const pollNotifications = async () => {
      try {
        console.log("[v0] Polling notifications for agent:", agentId)
        const response = await apiService.getNotifications(agentId)
        console.log("[v0] Notification response:", response)

        setLastPollTime(new Date())
        setPollError(null)
        setDebugInfo(`Polling ${agentId} - Found ${response.notifications?.length || 0} notifications`)

        if (response.notifications && response.notifications.length > 0) {
          console.log("[v0] New notifications received:", response.notifications.length)
          setNotifications((prev) => {
            const existingIds = prev.map((n) => n.session_id)
            const newNotifications = response.notifications.filter(
              (n: TransferNotification) => !existingIds.includes(n.session_id),
            )
            return [...prev, ...newNotifications]
          })

          const latestTransfer = response.notifications.find((n: TransferNotification) => n.type === "transfer_request")
          if (latestTransfer) {
            setTransferRoom(latestTransfer.transfer_room)
            setAgentBToken(latestTransfer.agent_b_token)
          }

          const completionNotification = response.notifications.find((n: any) => n.type === "transfer_completed")
          if (completionNotification) {
            console.log("[v0] Transfer completed notification received:", completionNotification)
            setOriginalRoom(completionNotification.original_room)
            setCustomerToken(completionNotification.customer_token)

            setTimeout(async () => {
              setConnectionStatus("with_customer")
              await handleJoinCustomerCall()
            }, 500)

            setNotifications((prev) => prev.filter((n) => n.session_id !== completionNotification.session_id))
          }
        }
      } catch (error) {
        console.error("[v0] Failed to poll notifications:", error)
        setPollError(error instanceof Error ? error.message : "Unknown error")
        setLastPollTime(new Date())
        setDebugInfo(`Error polling ${agentId}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    if (isPolling) {
      interval = setInterval(pollNotifications, 2000)
      pollNotifications()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [agentId, isPolling])

  const handleAcceptTransfer = (notification: TransferNotification) => {
    console.log("[v0] Accepting transfer:", notification)
    setTransferRoom(notification.transfer_room)
    setAgentBToken(notification.agent_b_token)
    setConnectionStatus("in_transfer")
    onJoinTransfer(notification.transfer_room, notification.agent_b_token)

    setNotifications((prev) => prev.filter((n) => n.session_id !== notification.session_id))
  }

  const handleJoinCustomerCall = async () => {
    console.log("[v0] Joining customer call")
    setConnectionStatus("with_customer")

    try {
      const newRoom = new Room()
      const track = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      })

      await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880", customerToken, {
        autoSubscribe: true,
      })

      await newRoom.localParticipant.publishTrack(track, {
        name: "microphone",
        source: Track.Source.Microphone,
      })

      setCustomerRoom(newRoom)
      setCustomerAudioTrack(track)
      setCallDuration(0)

      console.log("[v0] Successfully connected to customer room:", originalRoom)

      try {
        await apiService.addContext(
          originalRoom,
          "Agent B has joined the call and is now handling the customer",
          "System",
        )
      } catch (contextError) {
        console.warn("[v0] Failed to add context:", contextError)
      }
    } catch (error) {
      console.error("[v0] Failed to connect to customer room:", error)
      setConnectionStatus("listening")
      alert(`Failed to connect to customer room: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    onJoinCustomerCall(originalRoom, customerToken)
  }

  const toggleMute = async () => {
    if (customerAudioTrack) {
      if (isMuted) {
        await customerAudioTrack.unmute()
      } else {
        await customerAudioTrack.mute()
      }
    }
    setIsMuted((prev) => !prev)
    console.log(`[v0] Agent B microphone ${!isMuted ? "muted" : "unmuted"}`)
  }

  const leaveCustomerCall = async () => {
    try {
      if (originalRoom) {
        try {
          await apiService.addContext(originalRoom, "Agent B has left the call", "System")
        } catch (contextError) {
          console.warn("[v0] Failed to add context:", contextError)
        }
      }

      if (customerRoom) {
        await customerRoom.disconnect()
        setCustomerRoom(null)
      }

      if (customerAudioTrack) {
        customerAudioTrack.stop()
        setCustomerAudioTrack(null)
      }

      if (originalRoom) {
        await apiService.endCall(originalRoom)
      }

      setConnectionStatus("listening")
      setOriginalRoom("")
      setCustomerToken("")
      setCallDuration(0)
      setIsMuted(false)

      console.log("[v0] Agent B left customer call")
    } catch (error) {
      console.error("[v0] Error leaving customer call:", error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "listening":
        return "bg-blue-500"
      case "in_transfer":
        return "bg-yellow-500"
      case "with_customer":
        return "bg-green-500"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "listening":
        return "Listening for transfers"
      case "in_transfer":
        return "In transfer briefing"
      case "with_customer":
        return "Connected to customer"
      default:
        return "Offline"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-4 h-4 text-gray-600" />
          <h4 className="font-medium text-gray-900 dark:text-white">Agent Configuration</h4>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Agent B ID (must match transfer request)"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => {
              setNotifications([])
              setPollError(null)
              setDebugInfo(`Switched to agent: ${agentId}`)
            }}
            variant="outline"
            size="sm"
          >
            Update
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Current: {agentId} | {debugInfo}
        </p>
      </Card>

      {notifications.length > 0 && (
        <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-orange-600 animate-bounce" />
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">
              🔔 Incoming Transfer Requests ({notifications.length})
            </h3>
          </div>

          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <div
                key={`${notification.session_id}-${index}`}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <PhoneCall className="w-4 h-4 text-orange-600" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Session: {notification.session_id}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptTransfer(notification)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Accept Transfer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissNotification(notification.session_id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Agent B - Join Transfer</h3>
          <div className="ml-auto flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${isPolling ? "animate-pulse" : ""}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">{getStatusText()}</span>
            {connectionStatus === "with_customer" && <Phone className="w-4 h-4 text-green-600 ml-1" />}
          </div>
        </div>

        <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">
              Last check: {lastPollTime ? lastPollTime.toLocaleTimeString() : "Never"}
            </span>
            {pollError && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Error: {pollError}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Step 1: Join Transfer Room (Private briefing with Agent A)
            </label>
            <div className="space-y-2">
              <Input
                placeholder="Transfer Room ID"
                value={transferRoom}
                onChange={(e) => setTransferRoom(e.target.value)}
              />
              <Input placeholder="Agent B Token" value={agentBToken} onChange={(e) => setAgentBToken(e.target.value)} />
              <Button
                onClick={() => {
                  setConnectionStatus("in_transfer")
                  onJoinTransfer(transferRoom, agentBToken)
                }}
                disabled={!transferRoom || !agentBToken}
                className="w-full"
              >
                Join Transfer Room
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Step 2: Join Customer Call (After briefing)
            </label>
            {connectionStatus === "with_customer" && originalRoom && customerToken ? (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-100">🎉 Connected to Customer!</span>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  You're now connected to room: {originalRoom}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Original Room ID"
                  value={originalRoom}
                  onChange={(e) => setOriginalRoom(e.target.value)}
                />
                <Input
                  placeholder="Customer Token"
                  value={customerToken}
                  onChange={(e) => setCustomerToken(e.target.value)}
                />
                <Button
                  onClick={handleJoinCustomerCall}
                  disabled={!originalRoom || !customerToken}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Join Customer Call
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {connectionStatus === "with_customer" && (
        <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">Customer Call Active</h3>
            <p className="text-green-800 dark:text-green-200 mb-4">
              You're now connected to the customer. Agent A can leave the call.
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4 max-w-md mx-auto">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Room: {originalRoom}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration: {formatDuration(callDuration)}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center mb-2">
                <Volume2 className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Voice Connection Active</span>
              </div>
              <AudioInterface room={customerRoom} />
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

              <Button onClick={leaveCustomerCall} variant="destructive" size="lg">
                <PhoneOff className="w-4 h-4 mr-2" />
                Leave Call
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How Transfer Works:</h4>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>1. You'll receive automatic notifications when Agent A initiates a transfer</li>
          <li>2. Click "Accept Transfer" to join the transfer room for private briefing</li>
          <li>3. Agent A will provide customer context and complete the transfer</li>
          <li>4. You'll get customer room details to take over the conversation</li>
        </ol>
      </Card>
    </div>
  )
}
