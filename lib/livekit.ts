import { AccessToken, RoomServiceClient } from "livekit-server-sdk"

// LiveKit server configuration
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "devkey"
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "secret"
const LIVEKIT_WS_URL = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || "ws://localhost:7880"

// Room service client for server-side operations
export const roomService = new RoomServiceClient(
  LIVEKIT_WS_URL.replace("ws://", "http://").replace("wss://", "https://"),
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
)

// Generate access token for participants
export function generateAccessToken(roomName: string, participantName: string, metadata?: string): string {
  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantName,
    name: participantName,
    metadata: metadata,
  })

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })

  return token.toJwt()
}

// Create a new room
export async function createRoom(roomName: string) {
  try {
    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: 300, // 5 minutes
      maxParticipants: 10,
    })
    return room
  } catch (error) {
    console.error("Error creating room:", error)
    throw error
  }
}

// List active rooms
export async function listRooms() {
  try {
    const rooms = await roomService.listRooms()
    return rooms
  } catch (error) {
    console.error("Error listing rooms:", error)
    throw error
  }
}

// Delete a room
export async function deleteRoom(roomName: string) {
  try {
    await roomService.deleteRoom(roomName)
  } catch (error) {
    console.error("Error deleting room:", error)
    throw error
  }
}

// Get room participants
export async function getRoomParticipants(roomName: string) {
  try {
    const participants = await roomService.listParticipants(roomName)
    return participants
  } catch (error) {
    console.error("Error getting participants:", error)
    throw error
  }
}

// Remove participant from room
export async function removeParticipant(roomName: string, participantId: string) {
  try {
    await roomService.removeParticipant(roomName, participantId)
  } catch (error) {
    console.error("Error removing participant:", error)
    throw error
  }
}
