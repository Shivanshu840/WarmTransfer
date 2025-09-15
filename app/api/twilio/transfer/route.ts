import { type NextRequest, NextResponse } from "next/server"
import { TwilioIntegration } from "@/lib/twilio-integration"

export async function POST(request: NextRequest) {
  try {
    const { callSid, targetNumber, transferExplanation, transferType } = await request.json()

    if (!TwilioIntegration.isConfigured()) {
      return NextResponse.json({ error: "Twilio is not configured" }, { status: 400 })
    }

    if (!callSid || !targetNumber) {
      return NextResponse.json({ error: "Call SID and target number are required" }, { status: 400 })
    }

    let twimlUrl: string

    if (transferType === "sip") {
      // SIP transfer
      twimlUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/twiml/sip-transfer?target=${encodeURIComponent(
        targetNumber,
      )}`
    } else {
      // Regular phone transfer
      twimlUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/twiml/transfer?target=${encodeURIComponent(
        targetNumber,
      )}&explanation=${encodeURIComponent(transferExplanation || "Transferring your call.")}`
    }

    // Update the call to use new TwiML
    const call = await TwilioIntegration.getCall(callSid)
    if (call) {
      // Redirect the call to transfer TwiML
      const updatedCall = await TwilioIntegration.makeCall({
        to: targetNumber,
        url: twimlUrl,
      })

      return NextResponse.json({
        success: true,
        transferCallSid: updatedCall.sid,
        originalCallSid: callSid,
      })
    }

    return NextResponse.json({ error: "Call not found" }, { status: 404 })
  } catch (error) {
    console.error("Error transferring call:", error)
    return NextResponse.json({ error: "Failed to transfer call" }, { status: 500 })
  }
}
