import { type NextRequest, NextResponse } from "next/server"
import { generateAccessToken } from "@/lib/livekit"

export async function POST(request: NextRequest) {
  try {
    const { roomName, participantName, metadata } = await request.json()

    if (!roomName || !participantName) {
      return NextResponse.json({ error: "Room name and participant name are required" }, { status: 400 })
    }

    const token = generateAccessToken(roomName, participantName, metadata)

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error generating token:", error)
    return NextResponse.json({ error: "Failed to generate access token" }, { status: 500 })
  }
}
