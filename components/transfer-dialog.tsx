"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Clock, FileText, ArrowRight } from "lucide-react"

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transferData?: {
    summary: string
    transferExplanation: string
    agentBName: string
    callDuration: string
  }
  onConfirmTransfer: () => void
  isTransferring: boolean
}

export function TransferDialog({
  open,
  onOpenChange,
  transferData,
  onConfirmTransfer,
  isTransferring,
}: TransferDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Warm Transfer Preparation
          </DialogTitle>
          <DialogDescription>Review the call summary and transfer details before proceeding.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transfer Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Transfer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Receiving Agent:</span>
                <Badge className="bg-purple-500">{transferData?.agentBName || "Agent B"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Call Duration:</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="font-mono text-sm">{transferData?.callDuration || "0:00"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Call Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <p className="text-sm leading-relaxed">{transferData?.summary || "Generating call summary..."}</p>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Transfer Script */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">What You'll Say to Agent B</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-24">
                <p className="text-sm leading-relaxed italic text-muted-foreground">
                  "{transferData?.transferExplanation || "Preparing transfer explanation..."}"
                </p>
              </ScrollArea>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isTransferring}>
              Cancel
            </Button>
            <Button onClick={onConfirmTransfer} disabled={isTransferring} className="bg-orange-500 hover:bg-orange-600">
              {isTransferring ? "Initiating Transfer..." : "Start Transfer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
