import { UploadForm } from "@/components/UploadForm"

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Meeting Recording</h1>
        <p className="text-muted-foreground">
          Transform your meetings into actionable insights with AI-powered analysis
        </p>
      </div>
      <UploadForm />
    </div>
  )
}
