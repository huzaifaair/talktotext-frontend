const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

interface StatusData {
  status: string
  note_id: string | null
  progress: {
    stage: string
    percent: number
    message?: string
  } | null
}

class ApiClient {
  private baseURL: string
  private token: string | null = null
  private readonly TOKEN_KEY = "auth_token"

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      // 🔹 Always restore token on refresh
      const stored = localStorage.getItem(this.TOKEN_KEY)
      if (stored) {
        this.token = stored
      }
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem(this.TOKEN_KEY, token)
      else localStorage.removeItem(this.TOKEN_KEY)
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem(this.TOKEN_KEY)
    }
    return this.token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    const token = this.getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`

    try {
      const response = await fetch(url, { ...options, headers })
      const data = await response.json()

      if (!response.ok) {
        return { error: data.message || data.error || `HTTP ${response.status}` }
      }

      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Network error" }
    }
  }

async register(userData: { name: string; email: string; phone: string; password: string }) {
  const res = await this.request<{ token: string; user: any }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (res.data?.token) {
    this.setToken(res.data.token); // ✅ optional: auto-login after register
  }

  return res;
}


async login(credentials: { email: string; password: string }) {
  const res = await this.request<{ token: string; user: any }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (res.data?.token) {
    this.setToken(res.data.token); // ✅ store JWT in localStorage
  }

  return res;
}


  // 🔹 Upload endpoints
  async uploadFile(formData: FormData) {
  const headers: Record<string, string> = {
    Accept: "application/json", // ✅ Added
  };

  const token = this.getToken();
  console.log("📦 Upload Token from getToken():", token);
  if (token) headers["Authorization"] = `Bearer ${token}`;
  console.log("📦 Upload Headers:", headers);

  try {
    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok)
      return { error: data.message || data.error || `HTTP ${response.status}` };

    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed" };
  }
}

  async getStatus(uploadId: string): Promise<ApiResponse<StatusData>> {
    return this.request<StatusData>(`/api/status/${uploadId}`)
  }

  async getNote(noteId: string) {
    return this.request(`/api/notes/${noteId}`)
  }

  async getHistory() {
    return this.request("/api/history")
  }

  async downloadPDF(noteId: string): Promise<Blob | null> {
    try {
      const headers: Record<string, string> = {}
      const token = this.getToken()
      if (token) headers["Authorization"] = `Bearer ${token}`

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
      const token = this.getToken()
      if (token) headers["Authorization"] = `Bearer ${token}`

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
