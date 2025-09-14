"use client"

import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  useEffect(() => {
    // Check user's motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setAnimationsEnabled(!mediaQuery.matches)

    const handleChange = () => setAnimationsEnabled(!mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  if (!animationsEnabled) {
    return <div className="fixed inset-0 bg-background -z-10" />
  }

  return (
    <div className="animated-bg">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-primary rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-2000" />
      </div>
    </div>
  )
}
