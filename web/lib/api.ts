import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const apiService = {
  // Create a new call session
  createCall: async (data: { caller_id: string }) => {
    const response = await api.post("/api/create-call", data)
    return response.data
  },

  // Initiate warm transfer
  initiateTransfer: async (data: { session_id: string; agent_b_id: string }) => {
    const response = await api.post("/api/initiate-transfer", data)
    return response.data
  },

  // Complete the transfer
  completeTransfer: async (data: { session_id: string }) => {
    const response = await api.post("/api/complete-transfer", data)
    return response.data
  },

  // Add context to call
  addContext: async (session_id: string, message: string) => {
    const response = await api.post("/api/add-context", {
      session_id,
      message,
    })
    return response.data
  },

  // Get call status
  getCallStatus: async (session_id: string) => {
    const response = await api.get(`/api/call-status/${session_id}`)
    return response.data
  },

  // Twilio transfer (optional)
  twilioTransfer: async (data: { session_id: string; phone_number: string }) => {
    const response = await api.post("/api/twilio-transfer", data)
    return response.data
  },
}

export default api
