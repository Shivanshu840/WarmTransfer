import { type NextRequest, NextResponse } from "next/server"
import { TwilioIntegration } from "@/lib/twilio-integration"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const target = searchParams.get("target") || ""
  const explanation = searchParams.get("explanation") || "Transferring your call."

  const twiml = TwilioIntegration.generateTransferTwiML(explanation, target)

  return new NextResponse(twiml, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}
