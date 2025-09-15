"use client"

import { useState, useCallback } from "react"

interface TranscriptEntry {
  timestamp: Date
  speaker: string
  text: string
  sentiment?: "positive" | "neutral" | "negative"
  intent?: string
}

export function useTranscript() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const addEntry = useCallback(async (speaker: string, text: string) => {
    const entry: TranscriptEntry = {
      timestamp: new Date(),
      speaker,
      text,
    }

    // Analyze sentiment in real-time
    try {
      const response = await fetch("/api/llm/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        const sentimentData = await response.json()
        entry.sentiment = sentimentData.sentiment
        entry.intent = sentimentData.intent
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error)
    }

    setTranscript((prev) => [...prev, entry])
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript([])
  }, [])

  const startRecording = useCallback(() => {
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
  }, [])

  // Simulate adding transcript entries for demo
  const simulateConversation = useCallback(() => {
    const demoEntries = [
      { speaker: "Customer", text: "Hi, I'm having trouble with my billing. I was charged twice this month." },
      { speaker: "Agent A", text: "I'm sorry to hear about that. Let me look into your account right away." },
      { speaker: "Customer", text: "This is really frustrating. I've been a customer for 3 years." },
      { speaker: "Agent A", text: "I completely understand your frustration. I can see the duplicate charge here." },
      { speaker: "Customer", text: "Can you fix this quickly? I need this resolved today." },
    ]

    demoEntries.forEach((entry, index) => {
      setTimeout(() => {
        addEntry(entry.speaker, entry.text)
      }, index * 2000)
    })
  }, [addEntry])

  return {
    transcript,
    isRecording,
    addEntry,
    clearTranscript,
    startRecording,
    stopRecording,
    simulateConversation,
  }
}
