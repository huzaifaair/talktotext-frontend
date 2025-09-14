"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileText } from "lucide-react"

interface NoteCardProps {
  note: {
    note_id: string
    created_at: string
    summary_preview: string
  }
  index?: number
}

export function NoteCard({ note, index = 0 }: NoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              Note – {new Date(note.created_at).toLocaleDateString()}
            </CardTitle>
          </div>
          <CardDescription className="flex items-center gap-2 text-sm">
            <Calendar className="h-3 w-3" />
            {new Date(note.created_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {note.summary_preview || "No preview available."}
          </p>

          <div className="flex justify-end">
            <Button size="sm" variant="ghost" className="group-hover:bg-primary/10" asChild>
              <Link href={`/notes/${note.note_id}`}>
                <FileText className="h-4 w-4 mr-1" />
                View
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
