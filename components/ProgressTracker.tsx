"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePolling } from "@/lib/hooks/usePolling"
import { useUpload } from "@/lib/hooks/useUpload"
import { CheckCircle, Clock, AlertCircle, FileText } from "lucide-react"
import Link from "next/link"

const stages = [
  { key: "uploaded", label: "Uploaded", icon: CheckCircle },
  { key: "extracting", label: "Extracting Audio", icon: Clock },
  { key: "transcribing", label: "Transcribing", icon: Clock },
  { key: "translating", label: "Translating", icon: Clock },
  { key: "optimizing", label: "Optimizing", icon: Clock },
  { key: "summarizing", label: "Summarizing", icon: Clock },
  { key: "done", label: "Complete", icon: CheckCircle },
]

interface ProgressTrackerProps {
  uploadId?: string
}

export function ProgressTracker({ uploadId }: ProgressTrackerProps) {
  const { uploadId: contextUploadId, progress: uploadProgress } = useUpload()
  const currentUploadId = uploadId || contextUploadId

  const { status, noteId, progress, error } = usePolling(currentUploadId, !!currentUploadId)

  const currentProgress = progress || uploadProgress

  if (!currentUploadId) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No upload in progress</p>
          <Button asChild className="mt-4">
            <Link href="/upload">Start New Upload</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Processing Failed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">{error}</p>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/upload">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/history">View History</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "done" && noteId) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-primary neon-glow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <CheckCircle className="h-5 w-5" />
              <span>Processing Complete!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Your meeting notes are ready for review.</p>
            <div className="flex space-x-2">
              <Button className="neon-glow" asChild>
                <Link href={`/notes/${noteId}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Notes
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/upload">Process Another</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Your Meeting</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">Upload ID: {currentUploadId}</Badge>
          {status && <Badge>{status}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        {currentProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="capitalize">{currentProgress.stage}</span>
              <span>{currentProgress.percent}%</span>
            </div>
            <Progress value={currentProgress.percent} className="h-2" />
            {currentProgress.message && <p className="text-sm text-muted-foreground">{currentProgress.message}</p>}
          </div>
        )}

        {/* Stage Timeline */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const isActive = currentProgress?.stage === stage.key
            const isComplete = currentProgress && stages.findIndex((s) => s.key === currentProgress.stage) > index
            const IconComponent = stage.icon

            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive ? "bg-primary/10 border border-primary/20" : isComplete ? "bg-muted/50" : "opacity-50"
                }`}
              >
                <IconComponent
                  className={`h-5 w-5 ${
                    isActive ? "text-primary animate-pulse" : isComplete ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className={isActive ? "font-medium" : ""}>{stage.label}</span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Estimated Time */}
        {currentProgress && currentProgress.stage !== "done" && (
          <div className="text-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1" />
            Estimated time remaining: 2-5 minutes
          </div>
        )}
      </CardContent>
    </Card>
  )
}
