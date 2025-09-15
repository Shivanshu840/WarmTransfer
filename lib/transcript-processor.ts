import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface TranscriptEntry {
  timestamp: Date
  speaker: string
  text: string
  sentiment?: "positive" | "neutral" | "negative"
  intent?: string
}

export interface CallAnalysis {
  summary: string
  keyPoints: string[]
  customerSentiment: "positive" | "neutral" | "negative"
  urgency: "low" | "medium" | "high"
  category: string
  actionItems: string[]
  transferReason?: string
  recommendedAgent?: string
}

// Process real-time transcript and extract insights
export async function analyzeTranscript(transcript: TranscriptEntry[]): Promise<CallAnalysis> {
  try {
    const transcriptText = transcript
      .map((entry) => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
      .join("\n")

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are an AI call analyst. Analyze the conversation transcript and provide structured insights.
      Return a JSON object with the following structure:
      {
        "summary": "Brief 2-3 sentence summary",
        "keyPoints": ["point1", "point2", "point3"],
        "customerSentiment": "positive|neutral|negative",
        "urgency": "low|medium|high",
        "category": "billing|technical|sales|support|complaint",
        "actionItems": ["action1", "action2"],
        "transferReason": "reason if transfer is needed",
        "recommendedAgent": "specialist type if needed"
      }`,
      prompt: `Analyze this call transcript:

${transcriptText}

Provide comprehensive analysis focusing on customer needs, sentiment, and any issues requiring resolution.`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error analyzing transcript:", error)
    return {
      summary: "Unable to analyze call at this time.",
      keyPoints: [],
      customerSentiment: "neutral",
      urgency: "medium",
      category: "support",
      actionItems: [],
    }
  }
}

// Generate contextual transfer briefing
export async function generateTransferBriefing(
  analysis: CallAnalysis,
  receivingAgentName: string,
  specialization?: string,
): Promise<{
  briefSummary: string
  spokenHandoff: string
  writtenNotes: string
}> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are creating a transfer briefing for a warm handoff. Generate three versions:
      1. briefSummary: 1-2 sentences for quick reference
      2. spokenHandoff: Natural speech for Agent A to say to Agent B (under 100 words)
      3. writtenNotes: Detailed notes for Agent B's reference
      
      Return as JSON object with these three fields.`,
      prompt: `Create transfer briefing for ${receivingAgentName}${
        specialization ? ` (${specialization} specialist)` : ""
      }:

Call Analysis:
- Summary: ${analysis.summary}
- Key Points: ${analysis.keyPoints.join(", ")}
- Customer Sentiment: ${analysis.customerSentiment}
- Urgency: ${analysis.urgency}
- Category: ${analysis.category}
- Action Items: ${analysis.actionItems.join(", ")}
- Transfer Reason: ${analysis.transferReason || "General handoff"}

Generate appropriate briefing materials.`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error generating transfer briefing:", error)
    return {
      briefSummary: "Call transfer in progress.",
      spokenHandoff: `Hi ${receivingAgentName}, I'm transferring this call to you. Please take over from here.`,
      writtenNotes: "Transfer notes unavailable.",
    }
  }
}

// Real-time sentiment analysis for individual messages
export async function analyzeSentiment(text: string): Promise<{
  sentiment: "positive" | "neutral" | "negative"
  confidence: number
  intent?: string
}> {
  try {
    const { text: result } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `Analyze the sentiment and intent of the given text. Return JSON:
      {
        "sentiment": "positive|neutral|negative",
        "confidence": 0.0-1.0,
        "intent": "question|complaint|compliment|request|information|other"
      }`,
      prompt: `Analyze: "${text}"`,
    })

    return JSON.parse(result)
  } catch (error) {
    return {
      sentiment: "neutral",
      confidence: 0.5,
      intent: "other",
    }
  }
}

// Generate suggested responses for agents
export async function generateSuggestedResponses(
  transcript: TranscriptEntry[],
  context: CallAnalysis,
): Promise<string[]> {
  try {
    const lastFewMessages = transcript.slice(-3).map((entry) => `${entry.speaker}: ${entry.text}`)

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `Generate 3 helpful response suggestions for the agent based on the conversation context.
      Return as JSON array of strings. Keep responses professional, empathetic, and actionable.`,
      prompt: `Context:
- Category: ${context.category}
- Sentiment: ${context.customerSentiment}
- Urgency: ${context.urgency}

Recent conversation:
${lastFewMessages.join("\n")}

Generate 3 suggested responses for the agent.`,
    })

    return JSON.parse(text)
  } catch (error) {
    return [
      "I understand your concern. Let me help you with that.",
      "Thank you for bringing this to my attention. I'll look into this right away.",
      "I appreciate your patience. Let me find the best solution for you.",
    ]
  }
}
