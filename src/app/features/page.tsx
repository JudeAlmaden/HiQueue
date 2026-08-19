import Link from "next/link"
import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, BookOpen, ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import { FeaturesClient } from "./FeaturesClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Features & Tutorial Guide | HiQueue",
  description:
    "Learn how HiQueue works. Explore live queues, multi-counter support, self-service kiosks, TV display screens, and customizable branding.",
}

export default async function FeaturesPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <span className="hidden sm:inline-block h-4 w-px bg-border" />
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Features & Tutorial Guide
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Button>
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5 text-xs">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-xs">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Header Section */}
      <div className="bg-gradient-to-b from-primary/5 via-background to-background border-b border-border py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
            ✦ HiQueue User Guide & Capabilities
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            How HiQueue Works
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Discover all the powerful tools built to eliminate waiting line confusion, boost staff productivity, and give walk-in customers a seamless experience.
          </p>
        </div>
      </div>

      {/* Main Interactive Content */}
      <main className="flex-1 px-6 pt-12">
        <FeaturesClient isLoggedIn={isLoggedIn} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 bg-muted/20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HiQueue. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/features" className="hover:text-foreground font-semibold text-foreground transition-colors">
              Features & Guide
            </Link>
            <a
              href="https://github.com/JudeAlmaden/HiQueue"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
