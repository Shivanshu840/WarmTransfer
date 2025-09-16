const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const apiService = {
  createCall: async (data: { caller_id: string; room_name?: string }) => {
    const response = await fetch(`${BACKEND_URL}/api/create-call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create call: ${response.statusText}`)
    }

    return response.json()
  },

  addContext: async (sessionId: string, context: string) => {
    const response = await fetch(`${BACKEND_URL}/api/add-context`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: context,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to add context: ${response.statusText}`)
    }

    return response.json()
  },

  initiateTransfer: async (data: { session_id: string; agent_b_id: string }) => {
    const response = await fetch(`${BACKEND_URL}/api/initiate-transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to initiate transfer: ${response.statusText}`)
    }

    return response.json()
  },

  completeTransfer: async (data: { session_id: string }) => {
    const response = await fetch(`${BACKEND_URL}/api/complete-transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to complete transfer: ${response.statusText}`)
    }

    return response.json()
  },

  twilioTransfer: async (data: { session_id: string; phone_number: string }) => {
    const response = await fetch(`${BACKEND_URL}/api/twilio-transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to initiate Twilio transfer: ${response.statusText}`)
    }

    return response.json()
  },

  getCallStatus: async (sessionId: string) => {
    const response = await fetch(`${BACKEND_URL}/api/call-status/${sessionId}`)

    if (!response.ok) {
      throw new Error(`Failed to get call status: ${response.statusText}`)
    }

    return response.json()
  },

  healthCheck: async () => {
    const response = await fetch(`${BACKEND_URL}/api/health`)

    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.statusText}`)
    }

    return response.json()
  },

  endCall: async (sessionId: string) => {
    const response = await fetch(`${BACKEND_URL}/api/end-call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to end call: ${response.statusText}`)
    }

    return response.json()
  },
}
