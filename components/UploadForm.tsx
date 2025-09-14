"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUpload } from "@/lib/hooks/useUpload"
import { Upload, LinkIcon, FileAudio, FileVideo, File } from "lucide-react"

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
  const [uploadType, setUploadType] = useState<"file" | "url">("file")
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState("")
  const [language, setLanguage] = useState("auto")
  const [background, setBackground] = useState(true)
  const [extractDuration, setExtractDuration] = useState(120)
  const [dragActive, setDragActive] = useState(false)

  const { uploadFile, isUploading, error } = useUpload()
  const router = useRouter()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
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
    }
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (uploadType === "file" && !file) {
    return
  }
  if (uploadType === "url" && !url) {
    return
  }

  // ✅ call upload API
  const result = await uploadFile(
    uploadType === "file" ? file : null,
    uploadType === "url" ? url : null,
    { language, background, extractDuration }
  )

  if (result?.error) {
    console.error("Upload failed:", result.error)
    return
  }

  // ✅ Redirect
  if (background && result?.data?.upload_id) {
    router.push(`/upload/progress?id=${result.data.upload_id}`)
  } else if (!background && result?.data?.note_id) {
    router.push(`/notes/${result.data.note_id}`)
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
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="neon-glow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Upload Meeting Recording</CardTitle>
          <CardDescription className="text-center">
            Upload an audio/video file or provide a meeting URL for AI-powered transcription and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Upload Type Toggle */}
            <div className="flex space-x-2 p-1 bg-muted rounded-lg">
              <Button
                type="button"
                variant={uploadType === "file" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setUploadType("file")}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <Button
                type="button"
                variant={uploadType === "url" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setUploadType("url")}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Meeting URL
              </Button>
            </div>

            {/* File Upload */}
            {uploadType === "file" && (
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="flex items-center justify-center space-x-2">
                      {(() => {
                        const IconComponent = getFileIcon(file)
                        return <IconComponent className="h-8 w-8 text-primary" />
                      })()}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Drop your file here</p>
                      <p className="text-muted-foreground mb-4">Supports audio and video files (MP3, MP4, WAV, etc.)</p>
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
              </div>
            )}

            {/* URL Input */}
            {uploadType === "url" && (
              <div className="space-y-2">
                <Label htmlFor="meeting-url">Meeting URL</Label>
                <Input
                  id="meeting-url"
                  type="url"
                  placeholder="https://zoom.us/rec/... or https://meet.google.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
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
              <Switch id="background" checked={background} onCheckedChange={setBackground} />
              <Label htmlFor="background">Process in background (recommended for large files)</Label>
            </div>

            <Button
              type="submit"
              className="w-full neon-glow"
              disabled={isUploading || (uploadType === "file" && !file) || (uploadType === "url" && !url)}
            >
              {isUploading ? "Uploading..." : "Start Processing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
