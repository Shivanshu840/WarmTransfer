import { type NextRequest, NextResponse } from "next/server"
import { generateAccessToken, removeParticipant } from "@/lib/livekit"

// In-memory storage for demo (use database in production)
const transferSessions = new Map()

export async function POST(request: NextRequest) {
  try {
    const { transferId, callerId, agentBId } = await request.json()

    const transferSession = transferSessions.get(transferId)
    if (!transferSession) {
      return NextResponse.json({ error: "Transfer session not found" }, { status: 404 })
    }

    // Generate token for caller to join original room with Agent B
    const callerToken = generateAccessToken(
      transferSession.originalRoomName,
      callerId,
      JSON.stringify({ role: "caller", transferId }),
    )

    const agentBToken = generateAccessToken(
      transferSession.originalRoomName,
      agentBId,
      JSON.stringify({ role: "agent-b", transferId }),
    )

    // Remove Agent A from original room
    try {
      await removeParticipant(transferSession.originalRoomName, transferSession.agentAId)
    } catch (error) {
      console.log("Agent A may have already left the room")
    }

    // Update transfer session
    transferSession.status = "completed"
    transferSession.completedAt = new Date()
    transferSessions.set(transferId, transferSession)

    return NextResponse.json({
      success: true,
      tokens: {
        caller: callerToken,
        agentB: agentBToken,
      },
    })
  } catch (error) {
    console.error("Error completing transfer:", error)
    return NextResponse.json({ error: "Failed to complete transfer" }, { status: 500 })
  }
}
