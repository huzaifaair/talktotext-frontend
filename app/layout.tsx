import type { Metadata } from "next"
import { AppLoaderProvider } from "@/components/AppLoaderProvider"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/Navbar"
import { AnimatedBackground } from "@/components/AnimatedBackground"
import { Suspense } from "react"
import { Footer } from "@/components/Footer"
import "./globals.css"

export const metadata: Metadata = {
  title: "TalkToText Pro - AI Meeting Notes",
  description: "Transform your meetings into actionable insights with AI-powered transcription and analysis",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AppLoaderProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <Suspense fallback={null}>
              <AnimatedBackground />
              <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </Suspense>
          </ThemeProvider>
          <Analytics />
        </AppLoaderProvider>
      </body>
    </html>
  )
}
