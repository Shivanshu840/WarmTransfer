import { type NextRequest, NextResponse } from "next/server"
import { TwilioIntegration } from "@/lib/twilio-integration"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomName = searchParams.get("room") || "default-room"
  const participantName = searchParams.get("participant") || "phone-caller"

  const twiml = TwilioIntegration.generateConnectTwiML(roomName, participantName)

  return new NextResponse(twiml, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}

export async function POST(request: NextRequest) {
  // Handle POST requests the same way
  return GET(request)
}
