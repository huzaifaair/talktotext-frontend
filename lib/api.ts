const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token)
      } else {
        localStorage.removeItem("auth_token")
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    // ✅ Safe headers type
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.message || data.error || `HTTP ${response.status}` }
      }

      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Network error" }
    }
  }

  // 🔹 Auth endpoints
  async register(userData: { name: string; email: string; phone: string; password: string }) {
    return this.request<{ token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  // 🔹 Upload endpoints
  async uploadFile(formData: FormData) {
    const headers: Record<string, string> = {}
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`

    try {
      const response = await fetch(`${this.baseURL}/api/upload`, {
        method: "POST",
        headers,
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) return { error: data.message || data.error || `HTTP ${response.status}` }

      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Upload failed" }
    }
  }

  // 🔹 Status & Notes endpoints
  async getStatus(uploadId: string) {
    return this.request(`/api/status/${uploadId}`)
  }

  async getNote(noteId: string) {
    return this.request(`/api/notes/${noteId}`)
  }

  async getHistory() {
    return this.request("/api/history")
  }

  // 🔹 Download endpoints
  async downloadPDF(noteId: string): Promise<Blob | null> {
    try {
      const headers: Record<string, string> = {}
      if (this.token) headers["Authorization"] = `Bearer ${this.token}`

      const response = await fetch(`${this.baseURL}/api/download/pdf/${noteId}`, { headers })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.blob()
    } catch (error) {
      console.error("PDF download failed:", error)
      return null
    }
  }

  async downloadDOCX(noteId: string): Promise<Blob | null> {
    try {
      const headers: Record<string, string> = {}
      if (this.token) headers["Authorization"] = `Bearer ${this.token}`

      const response = await fetch(`${this.baseURL}/api/download/docx/${noteId}`, { headers })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.blob()
    } catch (error) {
      console.error("DOCX download failed:", error)
      return null
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
