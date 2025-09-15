"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, RotateCcw, Users, MessageSquare, ArrowRight } from "lucide-react"

interface DemoStep {
  id: number
  title: string
  description: string
  action: string
  duration: number
  type: "call" | "transfer" | "analysis" | "completion"
}

export function DemoSimulator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const demoSteps: DemoStep[] = [
    {
      id: 1,
      title: "Customer Connects",
      description: "Customer John calls about billing issue",
      action: "Establishing WebRTC connection to Agent Alice",
      duration: 3,
      type: "call",
    },
    {
      id: 2,
      title: "Conversation Begins",
      description: "Agent Alice assists with account verification",
      action: "Recording transcript and analyzing sentiment",
      duration: 5,
      type: "analysis",
    },
    {
      id: 3,
      title: "Issue Identified",
      description: "Double billing charge requires specialist",
      action: "AI detects billing category and medium urgency",
      duration: 2,
      type: "analysis",
    },
    {
      id: 4,
      title: "Transfer Initiated",
      description: "Agent Alice decides to transfer to billing specialist",
      action: "Creating handoff room and generating call summary",
      duration: 4,
      type: "transfer",
    },
    {
      id: 5,
      title: "Agent Briefing",
      description: "Agent Alice explains context to Agent Bob",
      action: "AI-generated transfer explanation delivered",
      duration: 3,
      type: "transfer",
    },
    {
      id: 6,
      title: "Transfer Complete",
      description: "Agent Bob takes over customer call",
      action: "Seamless handoff completed successfully",
      duration: 2,
      type: "completion",
    },
  ]

  const startDemo = () => {
    setIsPlaying(true)
    setCurrentStep(0)
    setCompletedSteps([])
    playNextStep()
  }

  const playNextStep = () => {
    if (currentStep < demoSteps.length) {
      const step = demoSteps[currentStep]
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step.id])
        setCurrentStep((prev) => prev + 1)
        if (currentStep + 1 < demoSteps.length) {
          playNextStep()
        } else {
          setIsPlaying(false)
        }
      }, step.duration * 1000)
    }
  }

  const resetDemo = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setCompletedSteps([])
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Users className="h-4 w-4" />
      case "analysis":
        return <MessageSquare className="h-4 w-4" />
      case "transfer":
        return <ArrowRight className="h-4 w-4" />
      case "completion":
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getStepColor = (type: string) => {
    switch (type) {
      case "call":
        return "bg-blue-500"
      case "analysis":
        return "bg-purple-500"
      case "transfer":
        return "bg-orange-500"
      case "completion":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Interactive Demo Simulator
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={startDemo} disabled={isPlaying} size="sm">
            <Play className="h-4 w-4 mr-2" />
            Start Demo
          </Button>
          <Button onClick={resetDemo} variant="outline" size="sm" className="bg-transparent">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {demoSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = currentStep === index && isPlaying
              const isPending = index > currentStep

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    isCurrent
                      ? "border-primary bg-primary/5 shadow-md"
                      : isCompleted
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-white ${
                        isCompleted ? "bg-green-500" : isCurrent ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      {isCompleted ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${isPending ? "text-gray-400" : ""}`}>{step.title}</h3>
                        <Badge className={getStepColor(step.type)} size="sm">
                          {step.type}
                        </Badge>
                        {isCurrent && (
                          <div className="flex items-center gap-1">
                            <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-xs text-primary">Active</span>
                          </div>
                        )}
                      </div>

                      <p className={`text-sm mb-2 ${isPending ? "text-gray-400" : "text-gray-600"}`}>
                        {step.description}
                      </p>

                      <div className={`text-xs ${isPending ? "text-gray-400" : "text-gray-500"}`}>
                        {getStepIcon(step.type)}
                        <span className="ml-1">{step.action}</span>
                        <span className="ml-2">({step.duration}s)</span>
                      </div>

                      {isCurrent && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {completedSteps.length === demoSteps.length && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <Users className="h-5 w-5" />
              <span className="font-medium">Demo Completed Successfully!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              The warm transfer workflow has been demonstrated. Customer John is now connected with Agent Bob who has
              full context of the billing issue.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
