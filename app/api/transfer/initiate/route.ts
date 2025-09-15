import { type NextRequest, NextResponse } from "next/server"
import { createRoom, generateAccessToken } from "@/lib/livekit"
import { generateCallSummary, generateTransferExplanation } from "@/lib/llm"
import type { TransferSession } from "@/types/transfer"

// In-memory storage for demo (use database in production)
const transferSessions = new Map<string, TransferSession>()

export async function POST(request: NextRequest) {
  try {
    const { originalRoomName, callerId, agentAId, agentBId, callContext } = await request.json()

    // Generate unique transfer session ID
    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const transferRoomName = `${transferId}_handoff`

    // Create transfer room
    await createRoom(transferRoomName)

    // Generate call summary
    const summary = await generateCallSummary({
      callId: originalRoomName,
      startTime: new Date(callContext.startTime),
      participants: [callerId, agentAId],
      transcript: callContext.transcript || [],
      metadata: callContext.metadata,
    })

    // Generate transfer explanation
    const transferExplanation = await generateTransferExplanation(summary, agentBId || "Agent B")

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
        transcript: callContext.transcript || [],
        metadata: callContext.metadata,
      },
      summary,
      transferExplanation,
      createdAt: new Date(),
    }

    transferSessions.set(transferId, transferSession)

    // Generate tokens for transfer room
    const agentAToken = generateAccessToken(transferRoomName, agentAId, JSON.stringify({ role: "agent-a", transferId }))

    const agentBToken = generateAccessToken(
      transferRoomName,
      agentBId || "agent-b",
      JSON.stringify({ role: "agent-b", transferId }),
    )

    return NextResponse.json({
      transferId,
      transferRoomName,
      summary,
      transferExplanation,
      tokens: {
        agentA: agentAToken,
        agentB: agentBToken,
      },
    })
  } catch (error) {
    console.error("Error initiating transfer:", error)
    return NextResponse.json({ error: "Failed to initiate transfer" }, { status: 500 })
  }
}
