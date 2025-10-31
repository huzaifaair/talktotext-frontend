"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { isLoggedIn, logout, getUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

const NavLink = ({
  href,
  children,
  isActive,
  onClick,
}: {
  href: string
  children: React.ReactNode
  isActive: boolean
  onClick?: () => void
}) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative text-sm font-medium transition-all duration-300 hover:text-primary",
        isActive
          ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]"
          : "text-muted-foreground hover:drop-shadow-[0_0_4px_hsl(var(--primary))]"
      )}
    >
      {children}
      {isActive && (
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
          layoutId="activeTab"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  </motion.div>
)

export function Navbar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateAuthState = () => {
      const logged = isLoggedIn()
      setLoggedIn(logged)
      if (logged) {
        const user = getUser()
        setUserName(user?.name || "User")
      } else {
        setUserName(null)
      }
    }

    updateAuthState()
    window.addEventListener("authChanged", updateAuthState)
    return () => window.removeEventListener("authChanged", updateAuthState)
  }, [])

  const handleLogout = () => {
    logout()
    setLoggedIn(false)
    setUserName(null)
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-lg md:text-xl">TalkToText Pro</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-4 md:space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-lg md:text-xl">TalkToText Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {loggedIn ? (
              <>
                <NavLink href="/" isActive={pathname === "/"}>
                  Home
                </NavLink>
                <NavLink href="/upload" isActive={pathname === "/upload"}>
                  Upload
                </NavLink>
                <NavLink href="/history" isActive={pathname === "/history"}>
                  History
                </NavLink>
              </>
            ) : (
              <>
                <NavLink href="/" isActive={pathname === "/"}>
                  Home
                </NavLink>
                <NavLink href="/upload" isActive={pathname === "/upload"}>
                  Upload
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Desktop Auth + Theme */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {loggedIn ? (
            <>
              <span className="text-sm font-medium text-muted-foreground">
                Hi, <span className="text-primary">{userName}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button size="sm" className="neon-glow hover:neon-glow" asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur"
          >
            <div className="container px-4 py-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                {loggedIn ? (
                  <>
                    <NavLink href="/" isActive={pathname === "/"} onClick={closeMobileMenu}>
                      Dashboard
                    </NavLink>
                    <NavLink href="/upload" isActive={pathname === "/upload"} onClick={closeMobileMenu}>
                      Upload
                    </NavLink>
                    <NavLink href="/history" isActive={pathname === "/history"} onClick={closeMobileMenu}>
                      History
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink href="/" isActive={pathname === "/"} onClick={closeMobileMenu}>
                      Dashboard
                    </NavLink>
                    <NavLink href="/upload" isActive={pathname === "/upload"} onClick={closeMobileMenu}>
                      Upload
                    </NavLink>
                  </>
                )}
              </nav>

              <div className="flex flex-col space-y-2 pt-4 border-t border-border/40">
                {loggedIn ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="hover:bg-destructive hover:text-destructive-foreground bg-transparent w-full"
                  >
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                      <Link href="/auth/login" onClick={closeMobileMenu}>
                        Login
                      </Link>
                    </Button>
                    <Button size="sm" className="neon-glow hover:neon-glow w-full" asChild>
                      <Link href="/auth/register" onClick={closeMobileMenu}>
                        Register
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
