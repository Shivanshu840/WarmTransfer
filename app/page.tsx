"use client"

import { useState } from "react"
import { AgentDashboard } from "@/components/agent-dashboard"
import { CallRoom } from "@/components/call-room"
import { TransferDialog } from "@/components/transfer-dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface CallSession {
  token: string
  roomName: string
  participantName: string
  role: "caller" | "agent-a" | "agent-b"
}

export default function HomePage() {
  const [currentView, setCurrentView] = useState<"dashboard" | "call">("dashboard")
  const [callSession, setCallSession] = useState<CallSession | null>(null)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [transferData, setTransferData] = useState<any>(null)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferStatus, setTransferStatus] = useState<string>("")

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || "ws://localhost:7880"

  const handleJoinAsAgent = async (agentId: string) => {
    try {
      // Generate a test room and token
      const roomName = `test_room_${Date.now()}`

      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          participantName: agentId,
          metadata: JSON.stringify({ role: agentId.includes("a") ? "agent-a" : "agent-b" }),
        }),
      })

      const { token } = await response.json()

      setCallSession({
        token,
        roomName,
        participantName: agentId,
        role: agentId.includes("a") ? "agent-a" : "agent-b",
      })
      setCurrentView("call")
    } catch (error) {
      console.error("Error joining as agent:", error)
    }
  }

  const handleCreateTestCall = async () => {
    try {
      const roomName = `test_call_${Date.now()}`

      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          participantName: "test-caller",
          metadata: JSON.stringify({ role: "caller" }),
        }),
      })

      const { token } = await response.json()

      setCallSession({
        token,
        roomName,
        participantName: "test-caller",
        role: "caller",
      })
      setCurrentView("call")
    } catch (error) {
      console.error("Error creating test call:", error)
    }
  }

  const handleTransferInitiate = async () => {
    if (!callSession) return

    try {
      // Mock transfer data for demo
      const mockTransferData = {
        summary:
          "Customer John called regarding billing issue with account #12345. He's been charged twice for the same service and needs a refund. Account verified, customer is frustrated but cooperative. Refund amount: $89.99.",
        transferExplanation:
          "Hi Agent Bob, I'm transferring John to you. He has a billing issue - double charged $89.99 for premium service. Account is verified and he needs a refund processed. He's been waiting about 8 minutes and is understandably frustrated but cooperative.",
        agentBName: "Agent Bob",
        callDuration: "8:45",
      }

      setTransferData(mockTransferData)
      setTransferDialogOpen(true)
    } catch (error) {
      console.error("Error initiating transfer:", error)
    }
  }

  const handleConfirmTransfer = async () => {
    setIsTransferring(true)
    setTransferStatus("in-progress")

    // Simulate transfer process
    setTimeout(() => {
      setTransferDialogOpen(false)
      setIsTransferring(false)
      setTransferStatus("completed")

      // Simulate successful transfer
      setTimeout(() => {
        setTransferStatus("")
        alert("Transfer completed successfully! Agent B has taken over the call.")
      }, 2000)
    }, 3000)
  }

  const handleLeaveRoom = () => {
    setCallSession(null)
    setCurrentView("dashboard")
    setTransferStatus("")
    setTransferData(null)
  }

  if (currentView === "call" && callSession) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView("dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="font-semibold">LiveKit Warm Transfer Demo</h1>
              <p className="text-sm text-muted-foreground">
                Connected as: {callSession.participantName} ({callSession.role})
              </p>
            </div>
          </div>
        </div>

        {/* Call Room */}
        <div className="flex-1">
          <CallRoom
            token={callSession.token}
            serverUrl={serverUrl}
            roomName={callSession.roomName}
            participantName={callSession.participantName}
            role={callSession.role}
            onTransferInitiate={handleTransferInitiate}
            onLeaveRoom={handleLeaveRoom}
            transferStatus={transferStatus}
          />
        </div>

        {/* Transfer Dialog */}
        <TransferDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          transferData={transferData}
          onConfirmTransfer={handleConfirmTransfer}
          isTransferring={isTransferring}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <AgentDashboard onJoinAsAgent={handleJoinAsAgent} onCreateTestCall={handleCreateTestCall} />
      </div>
    </div>
  )
}
