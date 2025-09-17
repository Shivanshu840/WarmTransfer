"use client"

import { useState } from "react"
import { AgentBInterface } from "../../components/AgentBInterface"
import type { CallSession } from "../../types"

export default function AgentBPage() {
  const [activeCall, setActiveCall] = useState<CallSession | null>(null)
  const [transferState, setTransferState] = useState<"waiting" | "briefing" | "customer">("waiting")

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Agent B Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Join transfer calls and take over customer conversations</p>
        </div>

        {/* Only render AgentBInterface - it handles all states internally */}
        <AgentBInterface onJoinTransfer={handleJoinTransfer} onJoinCustomerCall={handleJoinCustomerCall} />
      </div>
    </div>
  )
}