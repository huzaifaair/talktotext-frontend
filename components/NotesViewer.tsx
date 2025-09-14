"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { Download, FileText, Copy, Share2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"
import { normalizeMarkdown } from "@/lib/markdownUtils"

interface Note {
  note_id: string
  final_notes: string
  raw_transcript?: string
  cleaned_transcript?: string
  created_at?: string
  title?: string
}

interface NotesViewerProps {
  note: Note
}

export function NotesViewer({ note }: NotesViewerProps) {
  const [isDownloading, setIsDownloading] = useState<"pdf" | "docx" | null>(null)
  const { toast } = useToast()

  const handleDownload = async (format: "pdf" | "docx") => {
    setIsDownloading(format)

    try {
      const blob =
        format === "pdf"
          ? await apiClient.downloadPDF(note.note_id)
          : await apiClient.downloadDOCX(note.note_id)

      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${note.title || "meeting-notes"}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        if (format === "docx") {
          const { exportNoteAsDocx } = await import("@/lib/exporters")
          await exportNoteAsDocx({
            title: note.title || "Meeting Notes",
            created_at: note.created_at,
            abstract_summary: note.final_notes,
            transcript: note.cleaned_transcript || note.raw_transcript,
          })
        } else {
          const { exportNoteAsPDF } = await import("@/lib/exporters")
          await exportNoteAsPDF({
            title: note.title || "Meeting Notes",
            created_at: note.created_at,
            abstract_summary: note.final_notes,
            transcript: note.cleaned_transcript || note.raw_transcript,
          })
        }
      }

      toast({ title: "Download Ready", description: `${format.toUpperCase()} file has been prepared.` })
    } catch (err) {
      toast({
        title: "Download Failed",
        description: err instanceof Error ? err.message : "Failed to prepare file",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(null)
    }
  }

  const handleCopyToClipboard = async () => {
    const content = `
# Meeting Notes

## Final Notes
${note.final_notes || ""}

## Transcript
${note.cleaned_transcript || note.raw_transcript || ""}
    `.trim()

    try {
      await navigator.clipboard.writeText(content)
      toast({ title: "Copied to Clipboard", description: "Meeting notes copied." })
    } catch {
      toast({ title: "Copy Failed", description: "Failed to copy notes.", variant: "destructive" })
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: "Meeting Notes",
      text: note.final_notes?.slice(0, 200) || "",
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({ title: "Link Copied", description: "Meeting notes link copied." })
      } catch {
        toast({ title: "Share Failed", description: "Failed to share.", variant: "destructive" })
      }
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="neon-glow">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Meeting Notes</CardTitle>
              {note.created_at && (
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleDownload("pdf")} disabled={isDownloading === "pdf"} className="neon-glow">
              <Download className="h-4 w-4 mr-2" />
              {isDownloading === "pdf" ? "Downloading..." : "Download PDF"}
            </Button>
            <Button onClick={() => handleDownload("docx")} disabled={isDownloading === "docx"} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              {isDownloading === "docx" ? "Downloading..." : "Download DOCX"}
            </Button>
            <Button onClick={handleCopyToClipboard} variant="outline">
              <Copy className="h-4 w-4 mr-2" /> Copy Text
            </Button>
            <Button onClick={handleShare} variant="outline">
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Final Notes (Markdown rendered) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold underline decoration-primary decoration-2 underline-offset-4">Final Notes</CardTitle>
        </CardHeader>
        <CardContent>
  {note.final_notes ? (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown>{normalizeMarkdown(note.final_notes)}</ReactMarkdown>
    </div>
  ) : (
    <p>No notes available.</p>
  )}
</CardContent>
      </Card>

      {/* Transcript */}
      {(note.cleaned_transcript || note.raw_transcript) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Transcript</CardTitle>
            <CardDescription>{note.cleaned_transcript ? "Cleaned Transcript" : "Raw Transcript"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">{note.cleaned_transcript || note.raw_transcript}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
