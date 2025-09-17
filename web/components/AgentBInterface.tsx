"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Card } from "./ui/Card"
import { Users, ArrowRight, Bell, CheckCircle } from "lucide-react"
import { apiService } from "../lib/api"

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
}

export function AgentBInterface({ onJoinTransfer, onJoinCustomerCall }: AgentBInterfaceProps) {
  const [transferRoom, setTransferRoom] = useState("")
  const [agentBToken, setAgentBToken] = useState("")
  const [originalRoom, setOriginalRoom] = useState("")
  const [customerToken, setCustomerToken] = useState("")
  const [agentId] = useState("agent_b_001") // In real app, this would be from auth
  const [notifications, setNotifications] = useState<TransferNotification[]>([])
  const [isPolling, setIsPolling] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout

    const pollNotifications = async () => {
      try {
        const response = await apiService.getNotifications(agentId)
        if (response.notifications && response.notifications.length > 0) {
          setNotifications((prev) => [...prev, ...response.notifications])

          // Auto-fill the latest transfer notification
          const latestTransfer = response.notifications.find((n: TransferNotification) => n.type === "transfer_request")
          if (latestTransfer) {
            setTransferRoom(latestTransfer.transfer_room)
            setAgentBToken(latestTransfer.agent_b_token)
          }
        }
      } catch (error) {
        console.error("Failed to poll notifications:", error)
      }
    }

    if (isPolling) {
      // Poll every 2 seconds for new notifications
      interval = setInterval(pollNotifications, 2000)
      // Initial poll
      pollNotifications()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [agentId, isPolling])

  const handleAcceptTransfer = (notification: TransferNotification) => {
    setTransferRoom(notification.transfer_room)
    setAgentBToken(notification.agent_b_token)
    onJoinTransfer(notification.transfer_room, notification.agent_b_token)

    // Remove this notification
    setNotifications((prev) => prev.filter((n) => n.session_id !== notification.session_id))
  }

  const handleDismissNotification = (sessionId: string) => {
    setNotifications((prev) => prev.filter((n) => n.session_id !== sessionId))
  }

  return (
    <div className="space-y-6">
      {notifications.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Incoming Transfer Requests ({notifications.length})
            </h3>
          </div>

          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <div
                key={`${notification.session_id}-${index}`}
                className="bg-white dark:bg-gray-800 p-3 rounded-lg border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptTransfer(notification)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Accept
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
            <div className={`w-2 h-2 rounded-full ${isPolling ? "bg-green-500" : "bg-gray-400"}`} />
            <span className="text-xs text-gray-500">{isPolling ? "Listening for transfers" : "Offline"}</span>
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
                onClick={() => onJoinTransfer(transferRoom, agentBToken)}
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
                onClick={() => onJoinCustomerCall(originalRoom, customerToken)}
                disabled={!originalRoom || !customerToken}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Join Customer Call
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How Transfer Works:</h4>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>1. You'll receive automatic notifications when Agent A initiates a transfer</li>
          <li>2. Click "Accept" to join the transfer room for private briefing</li>
          <li>3. Agent A will provide customer context and complete the transfer</li>
          <li>4. You'll get customer room details to take over the conversation</li>
        </ol>
      </Card>
    </div>
  )
}
