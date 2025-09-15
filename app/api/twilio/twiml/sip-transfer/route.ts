import { type NextRequest, NextResponse } from "next/server"
import { TwilioIntegration } from "@/lib/twilio-integration"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const target = searchParams.get("target") || ""
  const displayName = searchParams.get("displayName")

  const twiml = TwilioIntegration.generateSipTransferTwiML(target, displayName || undefined)

  return new NextResponse(twiml, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}
