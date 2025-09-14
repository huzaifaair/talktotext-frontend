"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Clock, Zap } from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Drag & drop files or paste meeting URLs for instant processing",
  },
  {
    icon: Zap,
    title: "AI-Powered",
    description: "Advanced AI transcription and analysis in multiple languages",
  },
  {
    icon: FileText,
    title: "Smart Summaries",
    description: "Get key points, action items, and sentiment analysis automatically",
  },
  {
    icon: Clock,
    title: "Real-time Progress",
    description: "Track processing status with live updates and notifications",
  },
]

const stats = [
  { label: "Notes Processed", value: "2,847" },
  { label: "Languages Supported", value: "25+" },
  { label: "Average Processing Time", value: "2.3 min" },
  { label: "Accuracy Rate", value: "98.5%" },
]

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-20"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
          Transform Meetings into
          <span className="text-primary block">Actionable Insights</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          AI-powered transcription and analysis that turns your meeting recordings into structured notes, summaries, and
          action items in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="neon-glow text-lg px-8" asChild>
            <Link href="/upload">Start Processing</Link>
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" asChild>
            <Link href="/auth/register">Create Account</Link>
          </Button>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
      >
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features for Modern Teams</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center py-20"
      >
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of teams already using TalkToText Pro to streamline their meeting workflows.
            </p>
            <Button size="lg" className="neon-glow" asChild>
              <Link href="/upload">Upload Your First Meeting</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  )
}
