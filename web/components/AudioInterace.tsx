"use client"

import { useEffect, useRef, useState } from "react"
import { type Room, type RemoteTrack, type RemoteTrackPublication, type RemoteParticipant, Track } from "livekit-client"

interface AudioInterfaceProps {
  room: Room | null
  onParticipantConnected?: (participant: RemoteParticipant) => void
  onParticipantDisconnected?: (participant: RemoteParticipant) => void
}

export function AudioInterface({ room, onParticipantConnected, onParticipantDisconnected }: AudioInterfaceProps) {
  const [participants, setParticipants] = useState<RemoteParticipant[]>([])
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map())

  useEffect(() => {
    if (!room) return

    const handleTrackSubscribed = (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant,
    ) => {
      if (track.kind === Track.Kind.Audio) {
        const audioElement = track.attach()
        audioElement.autoplay = true

        // Store reference for cleanup
        audioElementsRef.current.set(participant.sid, audioElement)

        // Add to DOM (hidden)
        document.body.appendChild(audioElement)

        console.log("[v0] Audio track subscribed from participant:", participant.identity)
      }
    }

    const handleTrackUnsubscribed = (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant,
    ) => {
      if (track.kind === Track.Kind.Audio) {
        const audioElement = audioElementsRef.current.get(participant.sid)
        if (audioElement) {
          audioElement.remove()
          audioElementsRef.current.delete(participant.sid)
        }
        console.log("[v0] Audio track unsubscribed from participant:", participant.identity)
      }
    }

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      console.log("[v0] Participant connected:", participant.identity)
      setParticipants((prev) => [...prev, participant])
      onParticipantConnected?.(participant)
    }

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      console.log("[v0] Participant disconnected:", participant.identity)
      setParticipants((prev) => prev.filter((p) => p.sid !== participant.sid))

      // Clean up audio element
      const audioElement = audioElementsRef.current.get(participant.sid)
      if (audioElement) {
        audioElement.remove()
        audioElementsRef.current.delete(participant.sid)
      }

      onParticipantDisconnected?.(participant)
    }

    // Set up event listeners
    room.on("trackSubscribed", handleTrackSubscribed)
    room.on("trackUnsubscribed", handleTrackUnsubscribed)
    room.on("participantConnected", handleParticipantConnected)
    room.on("participantDisconnected", handleParticipantDisconnected)

    // Handle existing participants
    room.remoteParticipants.forEach((participant) => {
      setParticipants((prev) => [...prev, participant])
      participant.audioTrackPublications.forEach((publication) => {
        if (publication.track) {
          handleTrackSubscribed(publication.track, publication, participant)
        }
      })
    })

    return () => {
      // Clean up event listeners
      room.off("trackSubscribed", handleTrackSubscribed)
      room.off("trackUnsubscribed", handleTrackUnsubscribed)
      room.off("participantConnected", handleParticipantConnected)
      room.off("participantDisconnected", handleParticipantDisconnected)

      // Clean up all audio elements
      audioElementsRef.current.forEach((audioElement) => {
        audioElement.remove()
      })
      audioElementsRef.current.clear()
    }
  }, [room, onParticipantConnected, onParticipantDisconnected])

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400">
      {participants.length > 0 ? (
        <div>
          <span className="text-green-600">🔊</span> {participants.length} participant(s) connected
        </div>
      ) : (
        <div>Waiting for other participants...</div>
      )}
    </div>
  )
}
