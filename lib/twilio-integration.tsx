import twilio from "twilio"

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

// Initialize Twilio client
const twilioClient = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null

export interface TwilioCallOptions {
  to: string // Phone number or SIP URI
  from?: string // Twilio phone number
  url?: string // TwiML URL for call handling
  method?: "GET" | "POST"
  statusCallback?: string
  statusCallbackMethod?: "GET" | "POST"
  timeout?: number
}

export interface SIPTransferOptions {
  sipUri: string
  displayName?: string
  headers?: Record<string, string>
}

export class TwilioIntegration {
  // Check if Twilio is configured
  static isConfigured(): boolean {
    return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER)
  }

  // Make outbound call to phone number
  static async makeCall(options: TwilioCallOptions): Promise<any> {
    if (!twilioClient) {
      throw new Error("Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN")
    }

    try {
      const call = await twilioClient.calls.create({
        to: options.to,
        from: options.from || TWILIO_PHONE_NUMBER!,
        url: options.url || `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/twiml/connect`,
        method: options.method || "POST",
        statusCallback: options.statusCallback,
        statusCallbackMethod: options.statusCallbackMethod || "POST",
        timeout: options.timeout || 30,
      })

      return call
    } catch (error) {
      console.error("Error making Twilio call:", error)
      throw error
    }
  }

  // Create conference for warm transfer
  static async createConference(conferenceName: string): Promise<any> {
    if (!twilioClient) {
      throw new Error("Twilio is not configured")
    }

    try {
      const conference = await twilioClient.conferences.create({
        friendlyName: conferenceName,
        statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/conference/status`,
        statusCallbackMethod: "POST",
        record: false, // Set to true if you want to record
      })

      return conference
    } catch (error) {
      console.error("Error creating conference:", error)
      throw error
    }
  }

  // Add participant to conference
  static async addToConference(conferenceName: string, phoneNumber: string): Promise<any> {
    if (!twilioClient) {
      throw new Error("Twilio is not configured")
    }

    try {
      const participant = await twilioClient.conferences(conferenceName).participants.create({
        to: phoneNumber,
        from: TWILIO_PHONE_NUMBER!,
        earlyMedia: true,
        endConferenceOnExit: false,
      })

      return participant
    } catch (error) {
      console.error("Error adding participant to conference:", error)
      throw error
    }
  }

  // Transfer call using SIP REFER method
  static async sipTransfer(callSid: string, options: SIPTransferOptions): Promise<any> {
    if (!twilioClient) {
      throw new Error("Twilio is not configured")
    }

    try {
      // Update the call to transfer to SIP endpoint
      const call = await twilioClient.calls(callSid).update({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/twiml/sip-transfer`,
        method: "POST",
      })

      return call
    } catch (error) {
      console.error("Error performing SIP transfer:", error)
      throw error
    }
  }

  // Get call details
  static async getCall(callSid: string): Promise<any> {
    if (!twilioClient) {
      throw new Error("Twilio is not configured")
    }

    try {
      const call = await twilioClient.calls(callSid).fetch()
      return call
    } catch (error) {
      console.error("Error fetching call:", error)
      throw error
    }
  }

  // End call
  static async endCall(callSid: string): Promise<any> {
    if (!twilioClient) {
      throw new Error("Twilio is not configured")
    }

    try {
      const call = await twilioClient.calls(callSid).update({ status: "completed" })
      return call
    } catch (error) {
      console.error("Error ending call:", error)
      throw error
    }
  }

  // Generate TwiML for connecting to LiveKit
  static generateConnectTwiML(roomName: string, participantName: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Connecting you to the support team. Please hold.</Say>
    <Dial>
        <Stream url="wss://your-livekit-server.com/twilio" name="${roomName}">
            <Parameter name="participant_name" value="${participantName}" />
            <Parameter name="room_name" value="${roomName}" />
        </Stream>
    </Dial>
</Response>`
  }

  // Generate TwiML for warm transfer
  static generateTransferTwiML(transferExplanation: string, targetNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${transferExplanation}</Say>
    <Dial timeout="30">
        <Number>${targetNumber}</Number>
    </Dial>
    <Say voice="alice">The transfer could not be completed. Please try again later.</Say>
</Response>`
  }

  // Generate TwiML for SIP transfer
  static generateSipTransferTwiML(sipUri: string, displayName?: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial>
        <Sip${displayName ? ` username="${displayName}"` : ""}>${sipUri}</Sip>
    </Dial>
</Response>`
  }
}
