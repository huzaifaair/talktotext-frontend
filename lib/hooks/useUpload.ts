"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api"

export interface UploadOptions {
  language: string
  background: boolean
  extractDuration: number
}

export interface UploadProgress {
  stage: string
  percent: number
  message?: string
}

export interface UploadState {
  isUploading: boolean
  uploadId: string | null
  noteId: string | null
  progress: UploadProgress | null
  error: string | null
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    uploadId: null,
    noteId: null,
    progress: null,
    error: null,
  })

const uploadFile = useCallback(
  async (file: File | null, url: string | null, options: UploadOptions) => {
    if (!file && !url) {
      setState((prev) => ({ ...prev, error: "Please provide a file or URL" }))
      return { error: "Please provide a file or URL" }
    }

    setState((prev) => ({
      ...prev,
      isUploading: true,
      error: null,
      progress: { stage: "uploading", percent: 0 },
    }))

    const formData = new FormData()
    if (file) formData.append("file", file)
    if (url) formData.append("url", url)
    formData.append("language", options.language)
    formData.append("background", options.background.toString())
    formData.append("extractDuration", options.extractDuration.toString())

    const response = await apiClient.uploadFile(formData)

    if (response.error) {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: response.error || "Upload failed",
      }))
      return response
    }

    if (options.background && response.data?.upload_id) {
      setState((prev) => ({
        ...prev,
        uploadId: response.data.upload_id,
        progress: { stage: "uploaded", percent: 10 },
      }))
    } else if (response.data?.note_id) {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        noteId: response.data.note_id,
        progress: { stage: "done", percent: 100 },
      }))
    }

    return response // ✅ return to caller
  },
  []
)


  const reset = useCallback(() => {
    setState({
      isUploading: false,
      uploadId: null,
      noteId: null,
      progress: null,
      error: null,
    })
  }, [])

  return {
    ...state,
    uploadFile,
    reset,
  }
}
