"use client"

import { useState } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Card } from "./ui/Card"
import { Users, ArrowRight } from "lucide-react"

interface AgentBInterfaceProps {
  onJoinTransfer: (transferRoom: string, agentBToken: string) => void
  onJoinCustomerCall: (originalRoom: string, customerToken: string) => void
}

export function AgentBInterface({ onJoinTransfer, onJoinCustomerCall }: AgentBInterfaceProps) {
  const [transferRoom, setTransferRoom] = useState("")
  const [agentBToken, setAgentBToken] = useState("")
  const [originalRoom, setOriginalRoom] = useState("")
  const [customerToken, setCustomerToken] = useState("")

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Agent B - Join Transfer</h3>
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
          <li>1. Agent A initiates transfer and provides you with transfer room details</li>
          <li>2. Join the transfer room to get briefed by Agent A</li>
          <li>3. Agent A will provide customer room details when ready</li>
          <li>4. Join the customer call to take over the conversation</li>
        </ol>
      </Card>
    </div>
  )
}
