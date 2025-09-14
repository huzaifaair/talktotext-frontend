"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { LoadingScreen } from "@/components/LoadingScreen"

interface LoaderContextProps {
  setGlobalLoading: (value: boolean, message?: string) => void
}

const LoaderContext = createContext<LoaderContextProps>({
  setGlobalLoading: () => {},
})

export function AppLoaderProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("Loading...")
  const pathname = usePathname()

  // Route change loader
  useEffect(() => {
    setLoading(true)
    setMessage("Navigating...")
    const timer = setTimeout(() => setLoading(false), 500) // small delay for smoother UX
    return () => clearTimeout(timer)
  }, [pathname])

  const setGlobalLoading = (value: boolean, msg = "Loading...") => {
    setLoading(value)
    setMessage(msg)
  }

  return (
    <LoaderContext.Provider value={{ setGlobalLoading }}>
      <LoadingScreen isVisible={loading} message={message} />
      {children}
    </LoaderContext.Provider>
  )
}

// Custom hook to use loader in pages/components
export function useGlobalLoader() {
  return useContext(LoaderContext)
}
