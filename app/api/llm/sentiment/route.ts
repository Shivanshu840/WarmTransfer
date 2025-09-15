import { type NextRequest, NextResponse } from "next/server"
import { analyzeSentiment } from "@/lib/transcript-processor"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const result = await analyzeSentiment(text)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error analyzing sentiment:", error)
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}
