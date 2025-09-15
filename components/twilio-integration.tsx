"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, PhoneCall, PhoneOff, Settings, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface TwilioIntegrationProps {
  onPhoneCallInitiated?: (callSid: string) => void
  onTransferToPhone?: (phoneNumber: string) => void
}

export function TwilioIntegration({ onPhoneCallInitiated, onTransferToPhone }: TwilioIntegrationProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [sipUri, setSipUri] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [activeCalls, setActiveCalls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleMakeCall = async () => {
    if (!phoneNumber) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/twilio/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phoneNumber,
          roomName: `phone_call_${Date.now()}`,
          participantName: "phone-caller",
        }),
      })

      const data = await response.json()

      if (data.success) {
        const newCall = {
          sid: data.callSid,
          to: phoneNumber,
          status: data.status,
          startTime: new Date(),
        }

        setActiveCalls((prev) => [...prev, newCall])
        onPhoneCallInitiated?.(data.callSid)
        setPhoneNumber("")
      } else {
        alert(`Failed to make call: ${data.error}`)
      }
    } catch (error) {
      console.error("Error making call:", error)
      alert("Failed to make call")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransferCall = async (callSid: string, targetNumber: string, transferType: "phone" | "sip" = "phone") => {
    try {
      const response = await fetch("/api/twilio/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callSid,
          targetNumber,
          transferType,
          transferExplanation: "I'm transferring you to a specialist who can better assist you with your request.",
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update call status
        setActiveCalls((prev) => prev.map((call) => (call.sid === callSid ? { ...call, status: "transferred" } : call)))
        onTransferToPhone?.(targetNumber)
      } else {
        alert(`Failed to transfer call: ${data.error}`)
      }
    } catch (error) {
      console.error("Error transferring call:", error)
      alert("Failed to transfer call")
    }
  }

  const checkTwilioConfig = async () => {
    try {
      const response = await fetch("/api/twilio/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: "+1234567890" }), // Test call to check config
      })

      const data = await response.json()
      setIsConfigured(!data.error?.includes("not configured"))
    } catch (error) {
      setIsConfigured(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ringing":
        return "bg-yellow-500"
      case "in-progress":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      case "transferred":
        return "bg-blue-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Twilio Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {isConfigured ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Twilio is configured and ready</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-600">
                  Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER
                </span>
              </>
            )}
            <Button size="sm" variant="outline" onClick={checkTwilioConfig} className="ml-auto bg-transparent">
              Check Config
            </Button>
          </div>

          {!isConfigured && (
            <div className="p-3 bg-muted rounded text-sm">
              <p className="font-medium mb-2">To enable Twilio integration:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Sign up for a Twilio account and get free trial credits</li>
                <li>Get your Account SID and Auth Token from the Twilio Console</li>
                <li>Purchase or get a free Twilio phone number</li>
                <li>Set the environment variables in your project</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Make Outbound Call */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            Make Outbound Call
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!isConfigured}
              />
            </div>
            <div>
              <Label htmlFor="sip">SIP URI (Optional)</Label>
              <Input
                id="sip"
                placeholder="sip:user@domain.com"
                value={sipUri}
                onChange={(e) => setSipUri(e.target.value)}
                disabled={!isConfigured}
              />
            </div>
          </div>

          <Button
            onClick={handleMakeCall}
            disabled={!phoneNumber || !isConfigured || isLoading}
            className="w-full flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            {isLoading ? "Calling..." : "Make Call"}
          </Button>
        </CardContent>
      </Card>

      {/* Active Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Active Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-60">
            {activeCalls.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <PhoneOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active calls</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCalls.map((call) => (
                  <div key={call.sid} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{call.to}</span>
                      <Badge className={getStatusColor(call.status)}>{call.status}</Badge>
                    </div>

                    <div className="text-sm text-muted-foreground mb-3">
                      <div>Call SID: {call.sid}</div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Started: {call.startTime.toLocaleTimeString()}
                      </div>
                    </div>

                    {call.status === "in-progress" && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Transfer to number"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              const target = (e.target as HTMLInputElement).value
                              if (target) {
                                handleTransferCall(call.sid, target)
                                ;(e.target as HTMLInputElement).value = ""
                              }
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.querySelector(
                              `input[placeholder="Transfer to number"]`,
                            ) as HTMLInputElement
                            if (input?.value) {
                              handleTransferCall(call.sid, input.value)
                              input.value = ""
                            }
                          }}
                        >
                          Transfer
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Transfer Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Warm Transfer with Twilio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">1. Phone Transfer:</span> Transfer calls to real phone numbers with
              AI-generated context
            </div>
            <div>
              <span className="font-medium">2. SIP Transfer:</span> Transfer to SIP endpoints using the SIP REFER method
            </div>
            <div>
              <span className="font-medium">3. Context Sharing:</span> Agent A explains the call summary to the
              receiving party
            </div>
            <div>
              <span className="font-medium">4. Seamless Handoff:</span> Customer stays connected throughout the transfer
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
