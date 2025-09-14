"use client"

import { motion } from "framer-motion"
import { GeometricLoader } from "./GeometricLoader"

interface LoadingScreenProps {
  message?: string
  isVisible: boolean
}

export function LoadingScreen({ message = "Processing...", isVisible }: LoadingScreenProps) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="text-center space-y-6">
        <GeometricLoader size="lg" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-medium text-foreground"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  )
}
