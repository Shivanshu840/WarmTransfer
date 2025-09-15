export interface TransferSession {
  id: string
  originalRoomName: string
  transferRoomName: string
  callerId: string
  agentAId: string
  agentBId?: string
  status: "initiated" | "in-progress" | "completed" | "failed"
  callContext: {
    startTime: Date
    transcript: string[]
    metadata?: Record<string, any>
  }
  summary?: string
  transferExplanation?: string
  createdAt: Date
  completedAt?: Date
}

export interface Agent {
  id: string
  name: string
  type: "ai" | "human"
  status: "available" | "busy" | "offline"
  capabilities: string[]
}

export interface CallParticipant {
  id: string
  name: string
  role: "caller" | "agent-a" | "agent-b"
  joinedAt: Date
  leftAt?: Date
}
