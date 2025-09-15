import { type NextRequest, NextResponse } from "next/server"
import { TwilioIntegration } from "@/lib/twilio-integration"

export async function POST(request: NextRequest) {
  try {
    const { to, roomName, participantName } = await request.json()

    if (!TwilioIntegration.isConfigured()) {
      return NextResponse.json({ error: "Twilio is not configured" }, { status: 400 })
    }

    if (!to) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Create TwiML URL for connecting to LiveKit room
    const twimlUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/twiml/connect?room=${encodeURIComponent(
      roomName || "default-room",
    )}&participant=${encodeURIComponent(participantName || "phone-caller")}`

    const call = await TwilioIntegration.makeCall({
      to,
      url: twimlUrl,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/status`,
    })

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      status: call.status,
    })
  } catch (error) {
    console.error("Error making Twilio call:", error)
    return NextResponse.json({ error: "Failed to make call" }, { status: 500 })
  }
}
