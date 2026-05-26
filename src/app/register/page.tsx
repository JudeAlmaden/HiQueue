"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { registerUser } from "@/actions/auth-actions"
import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Layers, Globe, GitBranch, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)", color: "var(--on-surface)" }}>

      {/* Floating Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Column - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12" style={{ backgroundColor: "var(--secondary-container)" }}>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20" style={{ backgroundColor: "var(--primary)", filter: "blur(80px)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15" style={{ backgroundColor: "var(--tertiary)", filter: "blur(60px)", transform: "translate(30%, 30%)" }} />

        <div className="z-10 w-full max-w-lg space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "var(--primary)", color: "var(--on-primary)" }}>
              ✦ Get started free
            </span>
            <h2 className="text-4xl font-bold leading-tight" style={{ color: "var(--on-secondary-container)", letterSpacing: "-0.02em" }}>
              Your workspace, up and running in minutes.
            </h2>
            <p className="leading-relaxed" style={{ color: "var(--on-secondary-container)", opacity: 0.75 }}>
              Configure service desks, set wait thresholds, and start serving customers with a calm, organised experience.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: "✓", text: "No credit card required" },
              { icon: "✓", text: "Set up in under 2 minutes" },
              { icon: "✓", text: "Multi-desk and multi-agent support" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: "var(--primary)", color: "var(--on-primary)" }}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--on-secondary-container)" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8">

          {/* Logo */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold shadow-lg" style={{ backgroundColor: "var(--primary)", boxShadow: "0 4px 14px rgba(44,74,62,0.25)" }}>
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ color: "var(--on-surface)" }}>
                HiQueue
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight leading-tight" style={{ color: "var(--on-surface)", letterSpacing: "-0.02em" }}>
              Create account
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
              Set up your agent credentials to get started.
            </p>
          </div>

          {error && (
            <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "var(--error-container)", color: "var(--on-error-container)", border: "1px solid var(--error)" }}>
              {error}
            </div>
          )}

          <form
            action={async (formData) => {
              setIsLoading(true)
              setError(null)
              const res = await registerUser(formData)
              if (res?.error) {
                setError(res.error)
                setIsLoading(false)
              }
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold" style={{ color: "var(--on-surface-variant)", letterSpacing: "0.01em" }}>
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Alex Mercer"
                className="rounded-xl h-12 text-sm border-0 focus-visible:ring-2 transition-all"
                style={{ backgroundColor: "var(--surface-container)", color: "var(--on-surface)", outline: "1px solid var(--outline-variant)" }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold" style={{ color: "var(--on-surface-variant)", letterSpacing: "0.01em" }}>
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                className="rounded-xl h-12 text-sm border-0 focus-visible:ring-2 transition-all"
                style={{ backgroundColor: "var(--surface-container)", color: "var(--on-surface)", outline: "1px solid var(--outline-variant)" }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold" style={{ color: "var(--on-surface-variant)", letterSpacing: "0.01em" }}>
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="rounded-xl h-12 text-sm border-0 focus-visible:ring-2 transition-all"
                style={{ backgroundColor: "var(--surface-container)", color: "var(--on-surface)", outline: "1px solid var(--outline-variant)" }}
                required
              />
            </div>

            <Button
              disabled={isLoading}
              type="submit"
              className="w-full h-12 rounded-full font-semibold text-sm transition-all shadow-lg hover:opacity-90"
              style={{ backgroundColor: "var(--primary)", color: "var(--on-primary)", boxShadow: "0 4px 14px rgba(44,74,62,0.3)" }}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" style={{ borderColor: "var(--outline-variant)" }} />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-3 font-medium" style={{ backgroundColor: "var(--background)", color: "var(--on-surface-variant)" }}>
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11 rounded-full font-medium text-sm border transition-all hover:opacity-80" style={{ borderColor: "var(--outline-variant)", backgroundColor: "var(--surface-container-low)", color: "var(--on-surface)" }}>
                <GitBranch className="h-4 w-4 mr-2" /> GitHub
              </Button>
              <Button variant="outline" className="h-11 rounded-full font-medium text-sm border transition-all hover:opacity-80" style={{ borderColor: "var(--outline-variant)", backgroundColor: "var(--surface-container-low)", color: "var(--on-surface)" }}>
                <Globe className="h-4 w-4 mr-2" /> Google
              </Button>
            </div>
          </div>

          <p className="text-center text-sm" style={{ color: "var(--on-surface-variant)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline inline-flex items-center gap-1" style={{ color: "var(--primary)" }}>
              <ArrowLeft className="h-3 w-3" /> Sign in
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
