"use client"

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

function dispatchAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("authChanged"))
  }
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem(TOKEN_KEY)
}

export function getUser(): any | null {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message || "Login failed" }
    }

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user)) // ✅ save user
      dispatchAuthChanged() // 🔹 Notify Navbar
      return { success: true }
    }

    return { success: false, error: "No token received" }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export async function register(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message || "Registration failed" }
    }

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user)) // ✅ save user
      dispatchAuthChanged() // 🔹 Notify Navbar
      return { success: true }
    }

    return { success: false, error: "No token received" }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  dispatchAuthChanged() // 🔹 Notify Navbar
  window.location.href = "/"
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}
