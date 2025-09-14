"use client"

import { motion } from "framer-motion"

interface GeometricLoaderProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function GeometricLoader({ size = "md", className = "" }: GeometricLoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Background container */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated geometric shapes */}
        <motion.div
          className="absolute w-8 h-8 bg-primary/80 transform rotate-45"
          style={{ top: "10%", left: "20%" }}
          animate={{
            rotate: [45, 135, 225, 315, 45],
            scale: [1, 1.2, 0.8, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-6 h-6 bg-foreground/60 transform rotate-45"
          style={{ top: "60%", left: "70%" }}
          animate={{
            rotate: [0, 90, 180, 270, 360],
            scale: [0.8, 1.3, 0.9, 1.2, 0.8],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />

        <motion.div
          className="absolute w-10 h-4 bg-primary/60 transform rotate-12"
          style={{ top: "30%", left: "60%" }}
          animate={{
            rotate: [12, 102, 192, 282, 12],
            x: [0, 10, -5, 8, 0],
            y: [0, -8, 12, -4, 0],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.6,
          }}
        />

        <motion.div
          className="absolute w-5 h-8 bg-foreground/40 transform -rotate-12"
          style={{ top: "70%", left: "15%" }}
          animate={{
            rotate: [-12, 78, 168, 258, -12],
            scale: [1, 0.7, 1.4, 0.9, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.9,
          }}
        />

        <motion.div
          className="absolute w-7 h-7 bg-primary/70 transform rotate-45"
          style={{ top: "45%", left: "40%" }}
          animate={{
            rotate: [45, 135, 225, 315, 45],
            scale: [1.1, 0.6, 1.3, 0.8, 1.1],
            opacity: [0.7, 1, 0.5, 0.9, 0.7],
          }}
          transition={{
            duration: 2.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1.2,
          }}
        />

        <motion.div
          className="absolute w-4 h-6 bg-foreground/50 transform rotate-30"
          style={{ top: "15%", left: "75%" }}
          animate={{
            rotate: [30, 120, 210, 300, 30],
            x: [0, -6, 4, -2, 0],
            y: [0, 8, -6, 10, 0],
          }}
          transition={{
            duration: 2.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />
      </div>

      {/* Central pulsing element */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.5, 1, 1.8, 1],
          opacity: [1, 0.6, 1, 0.4, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
