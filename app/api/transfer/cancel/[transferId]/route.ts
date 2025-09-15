import { type NextRequest, NextResponse } from "next/server"
import { TransferManager } from "@/lib/transfer-manager"

export async function POST(request: NextRequest, { params }: { params: { transferId: string } }) {
  try {
    const transferId = params.transferId

    await TransferManager.cancelTransfer(transferId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error canceling transfer:", error)
    return NextResponse.json({ error: "Failed to cancel transfer" }, { status: 500 })
  }
}
