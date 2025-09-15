import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface CallContext {
  callId: string
  startTime: Date
  participants: string[]
  transcript: string[]
  metadata?: Record<string, any>
}

// Generate call summary using LLM
export async function generateCallSummary(context: CallContext): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are an AI assistant that creates concise call summaries for warm transfers. 
      Focus on key points, customer needs, and important context that the next agent should know.
      Keep summaries under 200 words and highlight actionable items.`,
      prompt: `Generate a call summary for warm transfer:
      
      Call ID: ${context.callId}
      Duration: ${Math.round((Date.now() - context.startTime.getTime()) / 1000 / 60)} minutes
      Participants: ${context.participants.join(", ")}
      
      Transcript:
      ${context.transcript.join("\n")}
      
      Additional Context:
      ${JSON.stringify(context.metadata, null, 2)}
      
      Please provide a clear, actionable summary for the receiving agent.`,
    })

    return text
  } catch (error) {
    console.error("Error generating call summary:", error)
    return "Unable to generate call summary at this time."
  }
}

// Generate transfer explanation for Agent A to speak
export async function generateTransferExplanation(summary: string, receivingAgentName: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are Agent A preparing to transfer a call. Create a brief, natural explanation 
      that you will speak to the receiving agent. Keep it conversational and under 100 words.`,
      prompt: `Create a spoken explanation for ${receivingAgentName} about this call transfer:
      
      Call Summary: ${summary}
      
      Format this as something Agent A would naturally say when handing off the call.`,
    })

    return text
  } catch (error) {
    console.error("Error generating transfer explanation:", error)
    return `Hi ${receivingAgentName}, I'm transferring this call to you. Please take over from here.`
  }
}
