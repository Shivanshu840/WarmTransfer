"use client"

import { useState } from "react"
import { CallInterface } from "../components/CallInterface"
import { TransferPanel } from "../components/TransferPanel"
import { CallStatus as CallStatusComponent } from "../components/CallStatus"
import { Phone, Users, ArrowRightLeft } from "lucide-react"
import type { CallSession, TransferState } from "../types"

export default function Home() {
  const [activeCall, setActiveCall] = useState<CallSession | null>(null)
  const [transferState, setTransferState] = useState<TransferState>("idle")

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-900 dark:text-white">Call Transfer System</h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Call Interface */}
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
              <Phone className="h-5 w-5" />
              Call Interface
            </div>
            <CallInterface
              onCallStart={setActiveCall}
              onCallEnd={() => setActiveCall(null)}
              onTransferStateChange={setTransferState}
            />
          </div>

          {/* Transfer Panel */}
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-600 dark:text-green-400">
              <ArrowRightLeft className="h-5 w-5" />
              Transfer Panel
            </div>
            <TransferPanel
              activeCall={activeCall}
              transferState={transferState}
              onTransferStateChange={setTransferState}
            />
          </div>
        </div>

        {/* Call Status */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-purple-600 dark:text-purple-400">
            <Users className="h-5 w-5" />
            Call Status
          </div>
          <CallStatusComponent activeCall={activeCall} transferState={transferState} />
        </div>
      </div>
    </main>
  )
}
