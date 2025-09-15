"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Users, MessageSquare, CheckCircle, Clock, Phone, UserCheck } from "lucide-react"

interface TransferFlowProps {
  transferId: string
  onTransferComplete?: () => void
  onTransferCancel?: () => void
}

export function TransferFlow({ transferId, onTransferComplete, onTransferCancel }: TransferFlowProps) {
  const [transferData, setTransferData] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const steps = [
    { id: 1, title: "Transfer Initiated", description: "Creating handoff room", icon: ArrowRight },
    { id: 2, title: "Agents Connected", description: "Agent A briefing Agent B", icon: Users },
    { id: 3, title: "Context Shared", description: "Call summary delivered", icon: MessageSquare },
    { id: 4, title: "Transfer Complete", description: "Agent B taking over", icon: CheckCircle },
  ]

  useEffect(() => {
    fetchTransferStatus()
    const interval = setInterval(fetchTransferStatus, 2000)
    return () => clearInterval(interval)
  }, [transferId])

  const fetchTransferStatus = async () => {
    try {
      const response = await fetch(`/api/transfer/status/${transferId}`)
      if (response.ok) {
        const data = await response.json()
        setTransferData(data)

        // Update step based on status
        switch (data.status) {
          case "initiated":
            setCurrentStep(1)
            break
          case "in-progress":
            setCurrentStep(2)
            break
          case "briefing":
            setCurrentStep(3)
            break
          case "completed":
            setCurrentStep(4)
            break
        }
      }
    } catch (error) {
      console.error("Error fetching transfer status:", error)
    }
  }

  const handleCompleteTransfer = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/transfer/complete-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferId,
          callerId: transferData?.callerId,
          agentBId: transferData?.agentBId,
        }),
      })

      if (response.ok) {
        setCurrentStep(4)
        onTransferComplete?.()
      }
    } catch (error) {
      console.error("Error completing transfer:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelTransfer = async () => {
    try {
      await fetch(`/api/transfer/cancel/${transferId}`, { method: "POST" })
      onTransferCancel?.()
    } catch (error) {
      console.error("Error canceling transfer:", error)
    }
  }

  if (!transferData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Transfer Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Transfer Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={(currentStep / steps.length) * 100} className="w-full" />

          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep
              const isFuture = step.id > currentStep

              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isFuture ? "text-muted-foreground" : ""}`}>{step.title}</div>
                    <div className={`text-sm ${isFuture ? "text-muted-foreground" : "text-muted-foreground"}`}>
                      {step.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-1">
                      <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-primary">Active</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transfer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Transfer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">From Agent</div>
              <div className="font-medium">{transferData.agentAId}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">To Agent</div>
              <div className="font-medium">{transferData.agentBId}</div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-sm text-muted-foreground mb-2">Call Summary</div>
            <ScrollArea className="h-20">
              <p className="text-sm">{transferData.summary}</p>
            </ScrollArea>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">Transfer Explanation</div>
            <ScrollArea className="h-16">
              <p className="text-sm italic text-muted-foreground">"{transferData.transferExplanation}"</p>
            </ScrollArea>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Started: {new Date(transferData.createdAt).toLocaleTimeString()}</span>
            <Badge variant="outline" className="ml-auto">
              {transferData.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            {currentStep < 4 && (
              <>
                <Button onClick={handleCompleteTransfer} disabled={isLoading} className="flex-1">
                  {isLoading ? "Completing..." : "Complete Transfer"}
                </Button>
                <Button variant="outline" onClick={handleCancelTransfer} className="flex-1 bg-transparent">
                  Cancel Transfer
                </Button>
              </>
            )}
            {currentStep === 4 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Transfer Completed Successfully</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
