"use client"
import { Badge } from "./ui/Badge"
import { Clock, User, Phone, ArrowRightLeft } from "lucide-react"

interface CallData {
  session_id?: string
  room_name?: string
  agent_id?: string
  ws_url?: string
}

interface CallStatusProps {
  callData: CallData
  transferState: "idle" | "initiating" | "active" | "completed"
}

export function CallStatus({ callData, transferState }: CallStatusProps) {
  const getStatusColor = (state: string) => {
    switch (state) {
      case "idle":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "initiating":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "active":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusText = (state: string) => {
    switch (state) {
      case "idle":
        return "Ready for Transfer"
      case "initiating":
        return "Setting up Transfer"
      case "active":
        return "Transfer in Progress"
      case "completed":
        return "Transfer Complete"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-4">
      {/* Transfer Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Transfer Status
        </span>
        <Badge className={getStatusColor(transferState)}>
          {getStatusText(transferState)}
        </Badge>
      </div>

      {/* Call Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Session ID
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              {callData.session_id?.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Room Name
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              {callData.room_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ArrowRightLeft className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Agent ID
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              {callData.agent_id?.slice(0, 12)}...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Connection
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">Active</p>
          </div>
        </div>
      </div>

      {/* Connection Info */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          WebSocket: {callData.ws_url}
        </p>
      </div>
    </div>
  )
}
