import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo (use database in production)
const transferSessions = new Map()

export async function GET(request: NextRequest, { params }: { params: { transferId: string } }) {
  try {
    const transferId = params.transferId
    const transferSession = transferSessions.get(transferId)

    if (!transferSession) {
      return NextResponse.json({ error: "Transfer session not found" }, { status: 404 })
    }

    return NextResponse.json(transferSession)
  } catch (error) {
    console.error("Error getting transfer status:", error)
    return NextResponse.json({ error: "Failed to get transfer status" }, { status: 500 })
  }
}
