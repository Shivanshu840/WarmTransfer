"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, PhoneIncoming, Users, Clock, Activity, CheckCircle, AlertCircle, User } from "lucide-react"

interface Agent {
  id: string
  name: string
  status: "available" | "busy" | "offline"
  currentCall?: string
  callsToday: number
  avgCallTime: string
}

interface ActiveCall {
  id: string
  caller: string
  agent: string
  duration: string
  status: "active" | "transferring" | "on-hold"
}

interface AgentDashboardProps {
  onJoinAsAgent: (agentId: string) => void
  onCreateTestCall: () => void
}

export function AgentDashboard({ onJoinAsAgent, onCreateTestCall }: AgentDashboardProps) {
  const [agents] = useState<Agent[]>([
    {
      id: "agent-a",
      name: "Agent Alice",
      status: "available",
      callsToday: 12,
      avgCallTime: "4:32",
    },
    {
      id: "agent-b",
      name: "Agent Bob",
      status: "available",
      callsToday: 8,
      avgCallTime: "6:15",
    },
    {
      id: "agent-c",
      name: "Agent Carol",
      status: "busy",
      currentCall: "call-123",
      callsToday: 15,
      avgCallTime: "3:45",
    },
  ])

  const [activeCalls] = useState<ActiveCall[]>([
    {
      id: "call-123",
      caller: "Customer John",
      agent: "Agent Carol",
      duration: "12:34",
      status: "active",
    },
    {
      id: "call-124",
      caller: "Customer Sarah",
      agent: "Agent Alice",
      duration: "3:21",
      status: "transferring",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-red-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "transferring":
        return "bg-orange-500"
      case "on-hold":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">Manage calls and warm transfers</p>
        </div>
        <Button onClick={onCreateTestCall} className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Create Test Call
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agents Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{agent.name}</span>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>{agent.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                      <div>Calls Today: {agent.callsToday}</div>
                      <div>Avg Time: {agent.avgCallTime}</div>
                    </div>

                    {agent.currentCall && (
                      <div className="text-xs text-orange-600 mb-2">Currently on: {agent.currentCall}</div>
                    )}

                    <Button
                      size="sm"
                      onClick={() => onJoinAsAgent(agent.id)}
                      disabled={agent.status === "offline"}
                      className="w-full"
                    >
                      Join as {agent.name}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Active Calls Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {activeCalls.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No active calls</p>
                  </div>
                ) : (
                  activeCalls.map((call) => (
                    <div key={call.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{call.caller}</span>
                        <Badge className={getCallStatusColor(call.status)}>{call.status}</Badge>
                      </div>

                      <div className="text-sm text-muted-foreground mb-2">
                        <div>Agent: {call.agent}</div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Duration: {call.duration}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          Monitor
                        </Button>
                        {call.status === "transferring" && (
                          <Button size="sm" className="flex-1">
                            Join Transfer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">Calls Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <PhoneIncoming className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Transfers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">5:12</div>
                <div className="text-sm text-muted-foreground">Avg Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">2</div>
                <div className="text-sm text-muted-foreground">Queue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
