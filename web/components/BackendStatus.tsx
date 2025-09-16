"use client"

import { useState, useEffect } from "react"
import { Card } from "./ui/Card"
import { Badge } from "./ui/Badge"
import { Button } from "./ui/Button"
import { RefreshCw, Server, AlertCircle, CheckCircle } from "lucide-react"
import { apiService } from "../lib/api"

interface HealthStatus {
  status: string
  livekit_configured: boolean
  twilio_configured: boolean
  livekit_url: string
  active_calls: number
}

export function BackendStatus() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const status = await apiService.healthCheck()
      setHealthStatus(status)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to backend")
      setHealthStatus(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Backend Status</h3>
        </div>
        <Button onClick={checkHealth} disabled={isLoading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-100">Backend Offline</p>
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {healthStatus && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Backend Connected</span>
            <Badge variant={"secondary" as const}>{healthStatus.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">LiveKit:</span>
              <Badge variant={healthStatus.livekit_configured ? ("default" as const) : ("secondary" as const)}>
                {healthStatus.livekit_configured ? "Configured" : "Not Set"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Twilio:</span>
              <Badge variant={healthStatus.twilio_configured ? ("default" as const) : ("secondary" as const)}>
                {healthStatus.twilio_configured ? "Configured" : "Not Set"}
              </Badge>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Active Calls:</span>
              <span className="font-medium">{healthStatus.active_calls}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-300">LiveKit URL:</span>
              <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {healthStatus.livekit_url}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
