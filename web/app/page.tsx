"use client"

import { useState } from "react"
import { AgentBInterface } from "../components/AgentBInterface"
import { CallInterface } from "../components/CallInterface"
import type { CallSession, TransferState } from "../types"

export default function AgentBPage() {
  const [activeCall, setActiveCall] = useState<CallSession | null>(null)
  const [transferState, setTransferState] = useState<"waiting" | "briefing" | "customer">("waiting")
  const [callTransferState, setCallTransferState] = useState<TransferState>("idle")

  const handleJoinTransfer = (transferRoom: string, agentBToken: string) => {
    // Create a call session for the transfer room
    const transferSession: CallSession = {
      session_id: `transfer_${Date.now()}`,
      room_name: transferRoom,
      caller_token: agentBToken,
      agent_token: agentBToken,
      agent_id: "agent_b",
      ws_url: "ws://localhost:7880",
    }

    setActiveCall(transferSession)
    setTransferState("briefing")
  }

  const handleJoinCustomerCall = (originalRoom: string, customerToken: string) => {
    // Create a call session for the customer room
    const customerSession: CallSession = {
      session_id: `customer_${Date.now()}`,
      room_name: originalRoom,
      caller_token: customerToken,
      agent_token: customerToken,
      agent_id: "agent_b",
      ws_url: "ws://localhost:7880",
    }

    setActiveCall(customerSession)
    setTransferState("customer")
  }

  const handleCallStart = (callData: CallSession | null) => {
    setActiveCall(callData)
  }

  const handleCallEnd = () => {
    setActiveCall(null)
    setTransferState("waiting")
    setCallTransferState("idle")
  }

  const handleTransferStateChange = (state: TransferState) => {
    setCallTransferState(state)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Agent B Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Join transfer calls and take over customer conversations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {transferState === "waiting" && (
              <AgentBInterface onJoinTransfer={handleJoinTransfer} onJoinCustomerCall={handleJoinCustomerCall} />
            )}

            {transferState === "briefing" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Transfer Room Active</h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  You're now in the transfer room with Agent A. Get briefed about the customer's situation.
                </p>
              </div>
            )}

            {transferState === "customer" && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Customer Call Active</h3>
                <p className="text-green-800 dark:text-green-200 text-sm">
                  You're now connected to the customer. Agent A can leave the call.
                </p>
              </div>
            )}
          </div>

          <div>
            <CallInterface
              onCallStart={handleCallStart}
              onTransferStateChange={handleTransferStateChange}
              onCallEnd={handleCallEnd}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
