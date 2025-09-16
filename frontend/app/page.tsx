"use client"

import { useState } from "react"
import { CallInterface } from "../components/CallInterface"
import { TransferPanel } from "../components/TransferPanel"
import { CallStatus } from "../components/CallStatus"
import { Phone, Users, ArrowRightLeft } from "lucide-react"

export default function Home() {
  const [activeCall, setActiveCall] = useState<any>(null)
  const [transferState, setTransferState] = useState<"idle" | "initiating" | "active" | "completed">("idle")

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <ArrowRightLeft className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Warm Transfer System</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience seamless call transfers with AI-powered context sharing using LiveKit and LLM integration
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Call Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Phone className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Call Interface</h2>
              </div>
              <CallInterface onCallStart={setActiveCall} onTransferStateChange={setTransferState} />
            </div>
          </div>

          {/* Transfer Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transfer Control</h2>
              </div>
              <TransferPanel
                activeCall={activeCall}
                transferState={transferState}
                onTransferStateChange={setTransferState}
              />
            </div>

            {/* Call Status */}
            {activeCall && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Call Status</h2>
                <CallStatus callData={activeCall} transferState={transferState} />
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">LiveKit Integration</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time audio communication with low latency and high quality
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Warm Transfer</h3>
            <p className="text-gray-600 dark:text-gray-300">Seamless agent handoffs with context preservation</p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Summaries</h3>
            <p className="text-gray-600 dark:text-gray-300">LLM-generated call summaries for better context sharing</p>
          </div>
        </div>
      </div>
    </main>
  )
}
