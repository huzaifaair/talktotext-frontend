"use client"

import React, { useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  LinkIcon,
  FileAudio,
  FileVideo,
  File,
  Mic,
  Square,
  Loader2,
} from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

const languages = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ur", label: "Urdu" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
]

export function UploadForm() {
  const router = useRouter()

  const [uploadType, setUploadType] = useState<"file" | "url" | "record">("file")
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState("")
  const [language, setLanguage] = useState("auto")
  const [background, setBackground] = useState(true)
  const [extractDuration, setExtractDuration] = useState(120)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [dragActive, setDragActive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [recordTime, setRecordTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 🧲 Drag + Drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setUploadType("file")
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setRecordedBlob(null)
    }
  }

  // 🎙️ Recording logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        setRecordedBlob(blob)
        const newFile = Object.assign(blob, {
          name: "recording.webm",
          lastModified: Date.now(),
        }) as File
        setFile(newFile)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
      mediaRecorderRef.current = mediaRecorder
      let seconds = 0
      timerRef.current = setInterval(() => setRecordTime(++seconds), 1000)
    } catch {
      alert("Microphone access denied or not supported.")
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setRecordTime(0)
  }

  // 🚀 Submit to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const fileToSend = uploadType !== "url" ? file : null
    const urlToSend = uploadType === "url" ? url : null

    if (!fileToSend && !urlToSend) {
      setError("Please upload a file, record audio, or enter a URL.")
      return
    }

    const formData = new FormData()
    if (fileToSend) formData.append("file", fileToSend)
    if (urlToSend) formData.append("url", urlToSend)
    formData.append("language", language)
    formData.append("background", String(background))
    formData.append("extractDuration", extractDuration.toString())

    try {
      setIsUploading(true)

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      if (background && data.upload_id) {
        router.push(`/upload/progress?id=${data.upload_id}`)
      } else if (!background && data.note_id) {
        router.push(`/notes/${data.note_id}`)
      } else {
        setError("Unexpected server response.")
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("audio/")) return FileAudio
    if (file.type.startsWith("video/")) return FileVideo
    return File
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="neon-glow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Upload or Record Meeting
          </CardTitle>
          <CardDescription className="text-center">
            Upload a file, paste a meeting URL, or record live audio for transcription.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Upload Type Buttons */}
            <div className="flex space-x-2 p-1 bg-muted rounded-lg">
              <Button
                type="button"
                variant={uploadType === "file" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setUploadType("file")}
              >
                <Upload className="h-4 w-4 mr-2" /> Upload File
              </Button>
              <Button
                type="button"
                variant={uploadType === "url" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setUploadType("url")}
              >
                <LinkIcon className="h-4 w-4 mr-2" /> Meeting URL
              </Button>
              <Button
                type="button"
                variant={uploadType === "record" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setUploadType("record")}
              >
                <Mic className="h-4 w-4 mr-2" /> Record
              </Button>
            </div>

            {/* File Upload Section */}
            {uploadType === "file" && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex items-center justify-center space-x-2">
                    {(() => {
                      const Icon = getFileIcon(file)
                      return <Icon className="h-8 w-8 text-primary" />
                    })()}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Drop your file here</p>
                    <p className="text-muted-foreground mb-4">
                      Supports audio and video files
                    </p>
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="audio/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}

            {/* URL Input */}
            {uploadType === "url" && (
              <div className="space-y-2">
                <Label htmlFor="meeting-url">Meeting URL</Label>
                <Input
                  id="meeting-url"
                  type="url"
                  placeholder="https://youtube.com/... or https://meet.google.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Recording Section */}
            {uploadType === "record" && (
              <div className="text-center space-y-3">
                <Button
                  type="button"
                  onClick={recording ? stopRecording : startRecording}
                  variant={recording ? "destructive" : "default"}
                  className="w-full flex items-center justify-center"
                >
                  {recording ? (
                    <>
                      <Square className="h-4 w-4 mr-2" /> Stop Recording ({recordTime}s)
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" /> Start Recording
                    </>
                  )}
                </Button>

                {recordedBlob && (
                  <audio
                    controls
                    src={URL.createObjectURL(recordedBlob)}
                    className="w-full rounded-md mt-2"
                  />
                )}
              </div>
            )}

            {/* Options */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Extract Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="30"
                  max="3600"
                  value={extractDuration}
                  onChange={(e) => setExtractDuration(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="background"
                checked={background}
                onCheckedChange={setBackground}
              />
              <Label htmlFor="background">Process in background (recommended)</Label>
            </div>

            <Button
              type="submit"
              className="w-full neon-glow"
              disabled={
                isUploading ||
                (uploadType === "file" && !file) ||
                (uploadType === "url" && !url) ||
                (uploadType === "record" && recording)
              }
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                "Start Processing"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
