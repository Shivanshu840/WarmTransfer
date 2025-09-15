"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Lightbulb,
  RefreshCw,
} from "lucide-react"

interface CallAnalyticsProps {
  transcript: Array<{
    timestamp: Date
    speaker: string
    text: string
    sentiment?: "positive" | "neutral" | "negative"
  }>
  onSuggestionsUpdate?: (suggestions: string[]) => void
}

export function CallAnalytics({ transcript, onSuggestionsUpdate }: CallAnalyticsProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalyzedLength, setLastAnalyzedLength] = useState(0)

  // Auto-analyze when transcript updates significantly
  useEffect(() => {
    if (transcript.length > lastAnalyzedLength + 3) {
      analyzeCall()
    }
  }, [transcript.length])

  const analyzeCall = async () => {
    if (transcript.length === 0) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/llm/analyze-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      })

      const data = await response.json()
      setAnalysis(data.analysis)
      setLastAnalyzedLength(transcript.length)

      // Get suggestions
      const suggestionsResponse = await fetch("/api/llm/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      })

      const suggestionsData = await suggestionsResponse.json()
      setSuggestions(suggestionsData.suggestions)
      onSuggestionsUpdate?.(suggestionsData.suggestions)
    } catch (error) {
      console.error("Error analyzing call:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-orange-500"
      default:
        return "bg-green-500"
    }
  }

  return (
    <div className="space-y-4">
      {/* Analysis Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Call Analytics
            </CardTitle>
            <Button size="sm" onClick={analyzeCall} disabled={isAnalyzing} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Analyzing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        {analysis && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                {getSentimentIcon(analysis.customerSentiment)}
                <span className="text-sm capitalize">{analysis.customerSentiment}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getUrgencyColor(analysis.urgency)}>{analysis.urgency} urgency</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{analysis.category}</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          </CardContent>
        )}
      </Card>

      {/* Key Points */}
      {analysis?.keyPoints && analysis.keyPoints.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Key Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.keyPoints.map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {analysis?.actionItems && analysis.actionItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.actionItems.map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggested Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    {suggestion}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recent Transcript */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {transcript.slice(-5).map((entry, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{entry.speaker}:</span>
                    <span className="text-xs text-muted-foreground">{entry.timestamp.toLocaleTimeString()}</span>
                    {entry.sentiment && getSentimentIcon(entry.sentiment)}
                  </div>
                  <p className="text-muted-foreground ml-2">{entry.text}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
