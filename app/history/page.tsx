"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { NoteCard } from "@/components/NoteCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Lock } from "lucide-react"
import { isLoggedIn, getToken } from "@/lib/auth"
import { apiClient } from "@/lib/api"
import Link from "next/link"

// Auth check component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLoggedIn(isLoggedIn())
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 pb-8">
              <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">Login to view your meeting history.</p>
              <div className="space-y-3">
                <Button asChild className="w-full neon-glow">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/auth/register">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}

export default function HistoryPage() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = getToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to load history")
        }

        setNotes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse text-center">Loading history...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-bold mb-6">Meeting History</h1>

          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <NoteCard key={note.note_id} note={note} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Notes Found</h3>
                <p className="text-muted-foreground mb-4">You haven’t processed any meetings yet.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </AuthGuard>
  )
}
