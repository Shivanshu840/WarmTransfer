import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get("CallSid")
    const callStatus = formData.get("CallStatus")
    const from = formData.get("From")
    const to = formData.get("To")

    console.log("Twilio Call Status Update:", {
      callSid,
      callStatus,
      from,
      to,
      timestamp: new Date().toISOString(),
    })

    // Here you could update your database with call status
    // or trigger other actions based on call events

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling Twilio status callback:", error)
    return NextResponse.json({ error: "Failed to process status callback" }, { status: 500 })
  }
}
