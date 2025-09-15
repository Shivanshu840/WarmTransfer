import { type NextRequest, NextResponse } from "next/server"
import { analyzeTranscript, generateTransferBriefing } from "@/lib/transcript-processor"
import type { TranscriptEntry } from "@/lib/transcript-processor"

export async function POST(request: NextRequest) {
  try {
    const { transcript, receivingAgentName, specialization } = await request.json()

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json({ error: "Valid transcript array is required" }, { status: 400 })
    }

    // Convert transcript data to proper format
    const formattedTranscript: TranscriptEntry[] = transcript.map((entry: any) => ({
      timestamp: new Date(entry.timestamp),
      speaker: entry.speaker,
      text: entry.text,
      sentiment: entry.sentiment,
      intent: entry.intent,
    }))

    // Analyze the call
    const analysis = await analyzeTranscript(formattedTranscript)

    // Generate transfer briefing if receiving agent is specified
    let briefing = null
    if (receivingAgentName) {
      briefing = await generateTransferBriefing(analysis, receivingAgentName, specialization)
    }

    return NextResponse.json({
      analysis,
      briefing,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error analyzing call:", error)
    return NextResponse.json({ error: "Failed to analyze call" }, { status: 500 })
  }
}
