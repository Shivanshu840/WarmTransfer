import { type NextRequest, NextResponse } from "next/server"
import { TransferManager } from "@/lib/transfer-manager"

export async function GET() {
  try {
    const agents = TransferManager.getAvailableAgents()
    return NextResponse.json({ agents })
  } catch (error) {
    console.error("Error getting agents:", error)
    return NextResponse.json({ error: "Failed to get agents" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { agentId, status } = await request.json()

    if (!agentId || !status) {
      return NextResponse.json({ error: "Agent ID and status are required" }, { status: 400 })
    }

    TransferManager.updateAgentStatus(agentId, status)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating agent status:", error)
    return NextResponse.json({ error: "Failed to update agent status" }, { status: 500 })
  }
}
