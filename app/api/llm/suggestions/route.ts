import { type NextRequest, NextResponse } from "next/server"
import { generateSuggestedResponses, analyzeTranscript } from "@/lib/transcript-processor"
import type { TranscriptEntry } from "@/lib/transcript-processor"

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json({ error: "Valid transcript array is required" }, { status: 400 })
    }

    // Convert and analyze transcript
    const formattedTranscript: TranscriptEntry[] = transcript.map((entry: any) => ({
      timestamp: new Date(entry.timestamp),
      speaker: entry.speaker,
      text: entry.text,
    }))

    const analysis = await analyzeTranscript(formattedTranscript)
    const suggestions = await generateSuggestedResponses(formattedTranscript, analysis)

    return NextResponse.json({
      suggestions,
      context: analysis,
    })
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
