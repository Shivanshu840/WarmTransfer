"use client"

import { DemoSimulator } from "@/components/demo-simulator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Github, FileText } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">LiveKit Warm Transfer Demo</h1>
            <p className="text-muted-foreground">Interactive demonstration of the warm transfer workflow</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Demo Simulator */}
          <div className="lg:col-span-2">
            <DemoSimulator />
          </div>

          {/* Demo Information */}
          <div className="space-y-6">
            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Demo Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500">Real-time</Badge>
                  <span className="text-sm">WebRTC Communication</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500">AI-Powered</Badge>
                  <span className="text-sm">Call Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-500">Seamless</Badge>
                  <span className="text-sm">Agent Handoffs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">Context</Badge>
                  <span className="text-sm">Preservation</span>
                </div>
              </CardContent>
            </Card>

            {/* Technology Stack */}
            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Frontend:</span> Next.js, TypeScript, Tailwind CSS
                </div>
                <div className="text-sm">
                  <span className="font-medium">Real-time:</span> LiveKit, WebRTC
                </div>
                <div className="text-sm">
                  <span className="font-medium">AI/ML:</span> OpenAI GPT-4, Sentiment Analysis
                </div>
                <div className="text-sm">
                  <span className="font-medium">Telephony:</span> Twilio (Optional)
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="https://github.com/your-repo" target="_blank">
                    <Github className="h-4 w-4 mr-2" />
                    View Source Code
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/api-docs" target="_blank">
                    <FileText className="h-4 w-4 mr-2" />
                    API Documentation
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="https://livekit.io" target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    LiveKit Documentation
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Demo Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle>Demo Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted rounded text-sm">
                  <div className="font-medium mb-1">Billing Issue</div>
                  <div className="text-muted-foreground">Customer charged twice, needs refund processing</div>
                </div>
                <div className="p-3 bg-muted rounded text-sm">
                  <div className="font-medium mb-1">Technical Support</div>
                  <div className="text-muted-foreground">API integration failing, requires specialist</div>
                </div>
                <div className="p-3 bg-muted rounded text-sm">
                  <div className="font-medium mb-1">Sales Inquiry</div>
                  <div className="text-muted-foreground">Upgrade interest, transfer to sales team</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
