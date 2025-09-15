import { createRoom, generateAccessToken, removeParticipant } from "./livekit"
import { generateTransferBriefing, analyzeTranscript } from "./transcript-processor"
import type { TransferSession, Agent } from "@/types/transfer"

// In-memory storage for demo (use database in production)
const transferSessions = new Map<string, TransferSession>()
const activeAgents = new Map<string, Agent>()

// Initialize some demo agents
activeAgents.set("agent-a", {
  id: "agent-a",
  name: "Agent Alice",
  type: "ai",
  status: "available",
  capabilities: ["general", "billing", "technical"],
})

activeAgents.set("agent-b", {
  id: "agent-b",
  name: "Agent Bob",
  type: "ai",
  status: "available",
  capabilities: ["billing", "refunds", "escalation"],
})

activeAgents.set("agent-c", {
  id: "agent-c",
  name: "Agent Carol",
  type: "human",
  status: "available",
  capabilities: ["technical", "enterprise", "escalation"],
})

export class TransferManager {
  // Step 1: Initiate warm transfer
  static async initiateTransfer(params: {
    originalRoomName: string
    callerId: string
    agentAId: string
    agentBId: string
    transcript: any[]
    callContext: any
  }): Promise<{
    transferId: string
    transferRoomName: string
    briefing: any
    tokens: { agentA: string; agentB: string }
  }> {
    const { originalRoomName, callerId, agentAId, agentBId, transcript, callContext } = params

    // Generate unique transfer session ID
    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const transferRoomName = `${transferId}_handoff`

    try {
      // Create transfer room for Agent A and Agent B to meet
      await createRoom(transferRoomName)

      // Analyze the call transcript
      const analysis = await analyzeTranscript(transcript)

      // Get agent details
      const agentB = activeAgents.get(agentBId)
      const agentBName = agentB?.name || agentBId

      // Generate transfer briefing
      const briefing = await generateTransferBriefing(analysis, agentBName, agentB?.capabilities?.[0])

      // Create transfer session
      const transferSession: TransferSession = {
        id: transferId,
        originalRoomName,
        transferRoomName,
        callerId,
        agentAId,
        agentBId,
        status: "initiated",
        callContext: {
          startTime: new Date(callContext.startTime),
          transcript: transcript || [],
          metadata: callContext.metadata,
        },
        summary: analysis.summary,
        transferExplanation: briefing.spokenHandoff,
        createdAt: new Date(),
      }

      transferSessions.set(transferId, transferSession)

      // Generate tokens for transfer room
      const agentAToken = generateAccessToken(
        transferRoomName,
        agentAId,
        JSON.stringify({ role: "agent-a", transferId, briefing: briefing.spokenHandoff }),
      )

      const agentBToken = generateAccessToken(
        transferRoomName,
        agentBId,
        JSON.stringify({ role: "agent-b", transferId, notes: briefing.writtenNotes }),
      )

      // Update agent statuses
      const agentAData = activeAgents.get(agentAId)
      const agentBData = activeAgents.get(agentBId)

      if (agentAData) {
        agentAData.status = "busy"
        activeAgents.set(agentAId, agentAData)
      }

      if (agentBData) {
        agentBData.status = "busy"
        activeAgents.set(agentBId, agentBData)
      }

      return {
        transferId,
        transferRoomName,
        briefing,
        tokens: {
          agentA: agentAToken,
          agentB: agentBToken,
        },
      }
    } catch (error) {
      console.error("Error initiating transfer:", error)
      throw new Error("Failed to initiate transfer")
    }
  }

  // Step 2: Complete the warm transfer
  static async completeTransfer(params: {
    transferId: string
    callerId: string
    agentBId: string
  }): Promise<{
    success: boolean
    tokens: { caller: string; agentB: string }
    originalRoomName: string
  }> {
    const { transferId, callerId, agentBId } = params

    const transferSession = transferSessions.get(transferId)
    if (!transferSession) {
      throw new Error("Transfer session not found")
    }

    try {
      // Generate tokens for caller and Agent B to join original room
      const callerToken = generateAccessToken(
        transferSession.originalRoomName,
        callerId,
        JSON.stringify({ role: "caller", transferId }),
      )

      const agentBToken = generateAccessToken(
        transferSession.originalRoomName,
        agentBId,
        JSON.stringify({ role: "agent-b", transferId, transferredFrom: transferSession.agentAId }),
      )

      // Remove Agent A from original room (they should have already left)
      try {
        await removeParticipant(transferSession.originalRoomName, transferSession.agentAId)
      } catch (error) {
        console.log("Agent A may have already left the room")
      }

      // Update transfer session
      transferSession.status = "completed"
      transferSession.completedAt = new Date()
      transferSessions.set(transferId, transferSession)

      // Update agent statuses
      const agentAData = activeAgents.get(transferSession.agentAId)
      const agentBData = activeAgents.get(agentBId)

      if (agentAData) {
        agentAData.status = "available"
        activeAgents.set(transferSession.agentAId, agentAData)
      }

      if (agentBData) {
        agentBData.status = "busy" // Still on the call
        activeAgents.set(agentBId, agentBData)
      }

      return {
        success: true,
        tokens: {
          caller: callerToken,
          agentB: agentBToken,
        },
        originalRoomName: transferSession.originalRoomName,
      }
    } catch (error) {
      console.error("Error completing transfer:", error)
      throw new Error("Failed to complete transfer")
    }
  }

  // Get transfer session details
  static getTransferSession(transferId: string): TransferSession | null {
    return transferSessions.get(transferId) || null
  }

  // Get all active transfers
  static getActiveTransfers(): TransferSession[] {
    return Array.from(transferSessions.values()).filter((session) => session.status !== "completed")
  }

  // Get available agents
  static getAvailableAgents(): Agent[] {
    return Array.from(activeAgents.values()).filter((agent) => agent.status === "available")
  }

  // Get agent by ID
  static getAgent(agentId: string): Agent | null {
    return activeAgents.get(agentId) || null
  }

  // Update agent status
  static updateAgentStatus(agentId: string, status: Agent["status"]): void {
    const agent = activeAgents.get(agentId)
    if (agent) {
      agent.status = status
      activeAgents.set(agentId, agent)
    }
  }

  // Cancel transfer
  static async cancelTransfer(transferId: string): Promise<void> {
    const transferSession = transferSessions.get(transferId)
    if (!transferSession) {
      throw new Error("Transfer session not found")
    }

    transferSession.status = "failed"
    transferSessions.set(transferId, transferSession)

    // Update agent statuses back to available
    this.updateAgentStatus(transferSession.agentAId, "available")
    if (transferSession.agentBId) {
      this.updateAgentStatus(transferSession.agentBId, "available")
    }
  }

  // Clean up completed transfers (call periodically)
  static cleanupOldTransfers(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago

    for (const [transferId, session] of transferSessions.entries()) {
      if (session.status === "completed" && session.completedAt && session.completedAt < cutoffTime) {
        transferSessions.delete(transferId)
      }
    }
  }
}
