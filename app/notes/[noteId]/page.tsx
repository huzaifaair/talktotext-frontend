"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { NotesViewer } from "@/components/NotesViewer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"   // ✅ import real API client

export default function NotePage() {
  const params = useParams()
  const noteId = params.noteId as string
  const [note, setNote] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await apiClient.getNote(noteId)   // ✅ real backend call
        if (response.error) {
          setError(response.error)
          return
        }

        setNote(response.data)  // ✅ real note set
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load note")
      } finally {
        setIsLoading(false)
      }
    }

    if (noteId) {
      fetchNote()
    }
  }, [noteId])

   if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Loading skeleton */}
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16" />
                    <div className="h-6 bg-muted rounded w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-4/5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button asChild>
              <Link href="/history">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Note Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The requested meeting note could not be found.
          </p>
          <Button asChild>
            <Link href="/history">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // ✅ Real NotesViewer render with backend note
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/history">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Link>
        </Button>
      </div>
      <NotesViewer note={note} />  {/* <-- real note */}
    </div>
  )
}
