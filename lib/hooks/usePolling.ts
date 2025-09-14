"use client"

import { useEffect, useRef, useState } from "react"
import { apiClient } from "@/lib/api"

interface PollingState {
  status: string
  noteId: string | null
  progress: {
    stage: string
    percent: number
    message?: string
  } | null
  error: string | null
}

export function usePolling(uploadId: string | null, enabled = true) {
  const [state, setState] = useState<PollingState>({
    status: "pending",
    noteId: null,
    progress: null,
    error: null,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)

  useEffect(() => {
    if (!uploadId || !enabled) {
      return
    }

    const poll = async () => {
      try {
        const response = await apiClient.getStatus(uploadId)

        if (response.error) {
          setState((prev) => ({ ...prev, error: response.error || "Status check failed" }))
          return
        }

        const data = response.data
        setState({
          status: data.status,
          noteId: data.note_id,
          progress: data.progress,
          error: null,
        })

        // Stop polling if done or failed
        if (data.status === "done" || data.status === "failed") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }

        retryCountRef.current = 0 // Reset retry count on success
      } catch (error) {
        retryCountRef.current++

        if (retryCountRef.current >= 5) {
          setState((prev) => ({
            ...prev,
            error: "Failed to get status after multiple attempts",
          }))
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      }
    }

    // Initial poll
    poll()

    // Set up polling interval with exponential backoff
    const getInterval = () => {
      const baseInterval = 2000 // 2 seconds
      const maxInterval = 30000 // 30 seconds
      return Math.min(baseInterval * Math.pow(1.5, retryCountRef.current), maxInterval)
    }

    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      intervalRef.current = setInterval(poll, getInterval())
    }

    startPolling()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [uploadId, enabled])

  return state
}
