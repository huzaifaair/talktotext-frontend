"use client"

import { create } from "zustand"
import { apiClient } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  phone?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: {
    name: string
    email: string
    phone: string
    password: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  checkAuth: () => void
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })

    const response = await apiClient.login({ email, password })

    if (response.error) {
      set({ isLoading: false })
      return { success: false, error: response.error }
    }

    if (response.data?.token) {
      apiClient.setToken(response.data.token)
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      })
      return { success: true }
    }

    set({ isLoading: false })
    return { success: false, error: "Invalid response from server" }
  },

  register: async (userData) => {
    set({ isLoading: true })

    const response = await apiClient.register(userData)

    if (response.error) {
      set({ isLoading: false })
      return { success: false, error: response.error }
    }

    if (response.data?.token) {
      apiClient.setToken(response.data.token)
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      })
      return { success: true }
    }

    set({ isLoading: false })
    return { success: false, error: "Invalid response from server" }
  },

  logout: () => {
    apiClient.setToken(null)
    set({
      user: null,
      isAuthenticated: false,
    })
  },

  checkAuth: () => {
    const token = apiClient.getToken()
    if (token) {
      // In a real app, you'd validate the token with the server
      set({ isAuthenticated: true })
    }
  },
}))
