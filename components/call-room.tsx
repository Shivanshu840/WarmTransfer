"use client"

import { useEffect, useState } from "react"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
  useRoomContext,
  useParticipants,
} from "@livekit/components-react"
import { Track } from "livekit-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneOff, Users, Clock } from "lucide-react"

interface CallRoomProps {
  token: string
  serverUrl: string
  roomName: string
  participantName: string
  role: "caller" | "agent-a" | "agent-b"
  onTransferInitiate?: () => void
  onLeaveRoom?: () => void
  transferStatus?: string
}

function CallRoomContent({
  role,
  onTransferInitiate,
  onLeaveRoom,
  transferStatus,
}: {
  role: "caller" | "agent-a" | "agent-b"
  onTransferInitiate?: () => void
  onLeaveRoom?: () => void
  transferStatus?: string
}) {
  const room = useRoomContext()
  const participants = useParticipants()
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  const [callDuration, setCallDuration] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "caller":
        return "bg-blue-500"
      case "agent-a":
        return "bg-green-500"
      case "agent-b":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Call Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Live Call - {room.name}
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatDuration(callDuration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{participants.length}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Badge className={getRoleColor(role)}>{role.replace("-", " ").toUpperCase()}</Badge>
            {transferStatus && <Badge variant="outline">Transfer: {transferStatus}</Badge>}
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.map((participant) => (
              <Badge key={participant.identity} variant="secondary">
                {participant.name || participant.identity}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      <div className="flex-1 mb-4">
        <GridLayout tracks={tracks} style={{ height: "100%" }}>
          <ParticipantTile />
        </GridLayout>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <ControlBar />
            <div className="flex gap-2">
              {role === "agent-a" && (
                <Button
                  onClick={onTransferInitiate}
                  disabled={transferStatus === "in-progress"}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {transferStatus === "in-progress" ? "Transferring..." : "Transfer Call"}
                </Button>
              )}
              <Button variant="destructive" onClick={onLeaveRoom} className="flex items-center gap-2">
                <PhoneOff className="h-4 w-4" />
                Leave Call
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoomAudioRenderer />
    </div>
  )
}

export function CallRoom(props: CallRoomProps) {
  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={props.token}
      serverUrl={props.serverUrl}
      data-lk-theme="default"
      style={{ height: "100vh" }}
      className="p-4"
    >
      <CallRoomContent
        role={props.role}
        onTransferInitiate={props.onTransferInitiate}
        onLeaveRoom={props.onLeaveRoom}
        transferStatus={props.transferStatus}
      />
    </LiveKitRoom>
  )
}
