# TalkToText Pro - AI Meeting Notes Frontend

Transform your meetings into actionable insights with AI-powered transcription and analysis. This Next.js frontend provides a beautiful, neon-themed interface for uploading meeting recordings and viewing structured notes with summaries, key points, action items, and sentiment analysis.

## 🚀 Features

- **Modern UI/UX**: Dark neon theme with cyberpunk aesthetics and smooth animations
- **File Upload**: Drag & drop interface for audio/video files or meeting URLs
- **Real-time Progress**: Live tracking of processing stages with animated progress indicators
- **AI-Powered Analysis**: Structured output with summaries, key points, action items, and sentiment
- **Multi-language Support**: 25+ languages with auto-detection
- **Download Options**: Export notes as PDF or DOCX files
- **History Management**: Advanced filtering, search, and bulk operations
- **User Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Mobile-first approach with accessibility features
- **Theme Toggle**: Light/dark mode with system preference detection

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with custom neon theme
- **Animations**: Framer Motion for smooth transitions
- **State Management**: Zustand for auth and upload state
- **UI Components**: shadcn/ui with custom modifications
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Mono
- **TypeScript**: Full type safety throughout

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Running Flask/Celery backend (see Backend Integration section)

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd talktotextpro
npm install
\`\`\`

### 2. Environment Setup

Copy the environment template:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Configure your environment variables in `.env.local`:

\`\`\`env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=TalkToText Pro

# Optional: Analytics
VERCEL_ANALYTICS_ID=your_analytics_id
\`\`\`

### 3. Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Backend Integration

This frontend is designed to work with a Flask/Celery backend. Ensure your backend provides these endpoints:

### Authentication Endpoints

\`\`\`
POST /auth/register
POST /auth/login
\`\`\`

### Upload & Processing Endpoints

\`\`\`
POST /api/upload          # File upload with multipart/form-data
GET  /api/status/{id}     # Processing status polling
GET  /api/notes/{id}      # Retrieve processed note
GET  /api/history         # User's note history
\`\`\`

### Download Endpoints

\`\`\`
GET /api/download/pdf/{id}   # Download PDF
GET /api/download/docx/{id}  # Download DOCX
\`\`\`

### Expected Response Formats

#### Upload Response (Background Processing)
\`\`\`json
{
  "upload_id": "uuid-string",
  "status": "uploaded"
}
\`\`\`

#### Status Response
\`\`\`json
{
  "status": "processing|done|failed",
  "note_id": "uuid-string",
  "progress": {
    "stage": "extracting|transcribing|summarizing|done",
    "percent": 75,
    "message": "Optional status message"
  }
}
\`\`\`

#### Note Response
\`\`\`json
{
  "id": "uuid-string",
  "title": "Meeting Title",
  "created_at": "2024-01-15T10:00:00Z",
  "language": "en",
  "duration": 1800,
  "abstract_summary": "Meeting summary...",
  "key_points": ["Point 1", "Point 2"],
  "action_items": [
    {
      "item": "Task description",
      "assignee": "Person Name",
      "due_date": "2024-01-22",
      "priority": "high|medium|low"
    }
  ],
  "sentiment": {
    "overall": "positive|neutral|negative",
    "score": 0.75,
    "analysis": "Sentiment analysis text..."
  },
  "participants": ["Name 1", "Name 2"],
  "meeting_type": "Standup",
  "transcript": "Full transcript..."
}
\`\`\`

## 🧪 Testing

### Running Tests

\`\`\`bash
# Unit tests
npm run test

# E2E tests (requires backend running)
npm run test:e2e
\`\`\`

### Manual Testing Checklist

#### Authentication Flow
- [ ] User registration with validation
- [ ] User login with error handling
- [ ] JWT token storage and refresh
- [ ] Logout functionality

#### Upload & Processing
- [ ] File drag & drop upload
- [ ] URL-based upload
- [ ] Progress tracking with polling
- [ ] Error handling for failed uploads
- [ ] Background vs immediate processing

#### Notes Management
- [ ] Note viewing with structured content
- [ ] PDF/DOCX download functionality
- [ ] Copy to clipboard feature
- [ ] Share functionality

#### History & Search
- [ ] Note filtering by language, type, status
- [ ] Search functionality
- [ ] Bulk selection and export
- [ ] Pagination (when implemented)

## 📱 Postman Testing

Import the provided Postman collection for comprehensive API testing:

### 1. Authentication Test Flow

\`\`\`javascript
// Register User
POST {{baseUrl}}/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+1234567890",
  "password": "password123"
}

// Expected: 200 OK with token
{
  "token": "jwt-token-string",
  "user": { "id": "...", "name": "Test User", "email": "test@example.com" }
}
\`\`\`

\`\`\`javascript
// Login User
POST {{baseUrl}}/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

// Expected: 200 OK with token
\`\`\`

### 2. Upload Test Flow

\`\`\`javascript
// Upload File (Background Processing)
POST {{baseUrl}}/api/upload
Headers: Authorization: Bearer {{token}}
Body: form-data
- file: [audio/video file]
- language: "auto"
- background: "true"
- extractDuration: "120"

// Expected: 200 OK
{
  "upload_id": "uuid-string",
  "status": "uploaded"
}
\`\`\`

### 3. Status Polling Test

\`\`\`javascript
// Check Processing Status
GET {{baseUrl}}/api/status/{{upload_id}}
Headers: Authorization: Bearer {{token}}

// Expected responses:
// Processing: { "status": "processing", "progress": { "stage": "transcribing", "percent": 45 } }
// Complete: { "status": "done", "note_id": "uuid-string" }
\`\`\`

### 4. Note Retrieval Test

\`\`\`javascript
// Get Processed Note
GET {{baseUrl}}/api/notes/{{note_id}}
Headers: Authorization: Bearer {{token}}

// Expected: 200 OK with full note object
\`\`\`

### 5. Download Test

\`\`\`javascript
// Download PDF
GET {{baseUrl}}/api/download/pdf/{{note_id}}
Headers: Authorization: Bearer {{token}}

// Expected: 200 OK with PDF blob
// Content-Type: application/pdf
\`\`\`

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   \`\`\`bash
   # Push to GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard:
     - `NEXT_PUBLIC_API_BASE_URL`: Your production backend URL
     - `NEXT_PUBLIC_APP_NAME`: TalkToText Pro

3. **Custom Domain** (Optional)
   - Add your custom domain in Vercel dashboard
   - Update CORS settings in your backend

### Manual Deployment

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | `TalkToText Pro` | No |
| `VERCEL_ANALYTICS_ID` | Vercel Analytics ID | - | No |

### Theme Customization

The neon theme can be customized in `app/globals.css`:

\`\`\`css
:root {
  --primary: #FFD34D;        /* Neon yellow */
  --background: #0b0b0b;     /* Deep black */
  --card: #1c1c1c;          /* Dark gray */
  /* ... other color tokens */
}
\`\`\`

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend Connection Failed
- **Symptom**: Network errors, CORS issues
- **Solution**: 
  - Verify `NEXT_PUBLIC_API_BASE_URL` is correct
  - Ensure backend is running and accessible
  - Check CORS configuration in backend

#### 2. Upload Stuck at "Uploaded"
- **Symptom**: Progress doesn't advance beyond upload
- **Solution**:
  - Check Celery worker is running: `celery -A app.celery worker --pool=solo` (Windows)
  - Verify Redis connection in backend
  - Check backend logs for processing errors

#### 3. PDF Download Unicode Errors
- **Symptom**: PDF generation fails with Unicode characters
- **Solution**:
  - Ensure backend has proper font support for Unicode
  - Fallback to plain text copy if PDF fails
  - Check backend PDF generation library configuration

#### 4. Authentication Issues
- **Symptom**: Token expired, login loops
- **Solution**:
  - Clear localStorage: `localStorage.clear()`
  - Check JWT token expiration in backend
  - Verify token format and signing key

### Performance Optimization

#### 1. Large File Uploads
- Use background processing for files > 50MB
- Implement upload progress indicators
- Add file size validation

#### 2. Animation Performance
- Animations respect `prefers-reduced-motion`
- Use CSS transforms for better performance
- Lazy load heavy components

## 📚 API Documentation

### Frontend API Client

The `apiClient` in `lib/api.ts` provides methods for all backend interactions:

\`\`\`typescript
// Authentication
await apiClient.login({ email, password })
await apiClient.register({ name, email, phone, password })

// Upload & Processing
await apiClient.uploadFile(formData)
await apiClient.getStatus(uploadId)

// Notes Management
await apiClient.getNote(noteId)
await apiClient.getNotes()
await apiClient.getHistory()

// Downloads
await apiClient.downloadPDF(noteId)
await apiClient.downloadDOCX(noteId)
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Community**: Join our Discord server for discussions

---

Built with ❤️ using Next.js, Tailwind CSS, and modern web technologies.
