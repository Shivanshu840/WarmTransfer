import { type NextRequest, NextResponse } from "next/server"
import { TransferManager } from "@/lib/transfer-manager"

export async function POST(request: NextRequest) {
  try {
    const { originalRoomName, callerId, agentAId, agentBId, transcript, callContext } = await request.json()

    if (!originalRoomName || !callerId || !agentAId || !agentBId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const result = await TransferManager.initiateTransfer({
      originalRoomName,
      callerId,
      agentAId,
      agentBId,
      transcript: transcript || [],
      callContext: callContext || { startTime: new Date(), metadata: {} },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error initiating transfer:", error)
    return NextResponse.json({ error: "Failed to initiate transfer" }, { status: 500 })
  }
}
