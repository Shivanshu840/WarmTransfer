import { type NextRequest, NextResponse } from "next/server"
import { TransferManager } from "@/lib/transfer-manager"

export async function POST(request: NextRequest) {
  try {
    const { transferId, callerId, agentBId } = await request.json()

    if (!transferId || !callerId || !agentBId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const result = await TransferManager.completeTransfer({
      transferId,
      callerId,
      agentBId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error completing transfer:", error)
    return NextResponse.json({ error: "Failed to complete transfer" }, { status: 500 })
  }
}
