export interface CallSession {
  session_id: string
  room_name: string
  caller_token: string
  agent_token: string
  agent_id: string
  ws_url: string
}

export interface TransferData {
  transfer_room: string
  agent_a_transfer_token: string
  agent_b_transfer_token: string
  call_summary: string
  ws_url: string
}

export interface CallStatus {
  caller_id: string
  room_name: string
  agent_a: string | null
  agent_b: string | null
  status: "active" | "transferring" | "transferred"
  created_at: string
  call_summary: string
  transfer_room: string | null
}

export type TransferState = "idle" | "initiating" | "active" | "completed"
