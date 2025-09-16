"use client"

import { useState, useCallback } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Card } from "./ui/Card"
import { ArrowRightLeft, User, Phone, CheckCircle } from "lucide-react"
import { apiService } from "../lib/api"

interface CallData {
  session_id?: string
  [key: string]: unknown
}

interface TransferResponse {
  call_summary?: string
  [key: string]: unknown
}

interface TransferPanelProps {
  activeCall: CallData | null
  transferState: "idle" | "initiating" | "active" | "completed"
  onTransferStateChange: (state: "idle" | "initiating" | "active" | "completed") => void
}

export function TransferPanel({ activeCall, transferState, onTransferStateChange }: TransferPanelProps) {
  const [agentBName, setAgentBName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [transferData, setTransferData] = useState<TransferResponse | null>(null)
  const [callSummary, setCallSummary] = useState("")

  const initiateTransfer = useCallback(async () => {
    if (!activeCall?.session_id) {
      alert("No active call to transfer")
      return
    }

    if (!agentBName.trim()) {
      alert("Please enter Agent B name")
      return
    }

    onTransferStateChange("initiating")

    try {
      await apiService.addContext(activeCall.session_id, `Customer requesting transfer to ${agentBName}`)

      const response: TransferResponse = await apiService.initiateTransfer({
        session_id: activeCall.session_id,
        agent_b_id: agentBName.trim(),
      })

      setTransferData(response)
      setCallSummary(response.call_summary ?? "")
      onTransferStateChange("active")
    } catch (error) {
      console.error("Failed to initiate transfer:", error)
      alert("Failed to initiate transfer. Please try again.")
      onTransferStateChange("idle")
    }
  }, [activeCall, agentBName, onTransferStateChange])

  const completeTransfer = useCallback(async () => {
    if (!activeCall?.session_id) return

    try {
      await apiService.completeTransfer({
        session_id: activeCall.session_id,
      })

      onTransferStateChange("completed")
    } catch (error) {
      console.error("Failed to complete transfer:", error)
      alert("Failed to complete transfer. Please try again.")
    }
  }, [activeCall, onTransferStateChange])

  const twilioTransfer = useCallback(async () => {
    if (!activeCall?.session_id || !phoneNumber.trim()) {
      alert("Please enter a phone number")
      return
    }

    try {
      const response: TransferResponse = await apiService.twilioTransfer({
        session_id: activeCall.session_id,
        phone_number: phoneNumber.trim(),
      })

      setCallSummary(response.call_summary ?? "")
      alert("Twilio transfer initiated successfully!")
    } catch (error) {
      console.error("Failed to initiate Twilio transfer:", error)
      alert("Failed to initiate Twilio transfer. Please check your configuration.")
    }
  }, [activeCall, phoneNumber])

  if (!activeCall) {
    return (
      <Card className="p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowRightLeft className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Call</h3>
        <p className="text-gray-600 dark:text-gray-300">Start a call to enable transfer options</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Transfer to Agent B</h3>
        </div>

        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Agent B Name"
            value={agentBName}
            onChange={(e) => setAgentBName(e.target.value)}
            disabled={transferState !== "idle"}
          />

          {transferState === "idle" && (
            <Button onClick={initiateTransfer} disabled={!agentBName.trim()} className="w-full">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Initiate Transfer
            </Button>
          )}

          {transferState === "initiating" && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Setting up transfer room...</p>
            </div>
          )}

          {transferState === "active" && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Transfer Room Active</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Agent A is briefing Agent B</p>
              </div>

              <Button onClick={completeTransfer} className="w-full" variant="default">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Transfer
              </Button>
            </div>
          )}

          {transferState === "completed" && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900 dark:text-green-100">Transfer Completed</p>
              <p className="text-xs text-green-700 dark:text-green-300">Customer is now with Agent B</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Phone className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Transfer to Phone</h3>
          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
            Optional
          </span>
        </div>

        <div className="space-y-3">
          <Input
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <Button
            onClick={twilioTransfer}
            disabled={!phoneNumber.trim()}
            className="w-full bg-transparent"
            variant="outline"
          >
            <Phone className="w-4 h-4 mr-2" />
            Transfer via Twilio
          </Button>
        </div>
      </Card>

      {callSummary && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">AI-Generated Call Summary</h3>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">{callSummary}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
