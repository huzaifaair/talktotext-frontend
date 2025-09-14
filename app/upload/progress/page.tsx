"use client"

import { ProgressTracker } from "@/components/ProgressTracker"
import { useSearchParams } from "next/navigation"

export default function ProgressPage() {
  const searchParams = useSearchParams()
  const uploadId = searchParams.get("id")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Processing Your Meeting</h1>
        <p className="text-muted-foreground">Please wait while we transcribe and analyze your recording</p>
      </div>
      <div className="max-w-2xl mx-auto">
        <ProgressTracker uploadId={uploadId || undefined} />
      </div>
    </div>
  )
}
