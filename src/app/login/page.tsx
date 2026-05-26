"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { loginUser } from "@/actions/auth-actions"
import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Layers, Globe, GitBranch, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)", color: "var(--on-surface)" }}>

      {/* Floating Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Column - Form */}
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
              Welcome back
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
              Sign in to manage your queue workspace.
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
              const res = await loginUser(formData)
              if (res?.error) {
                setError(res.error)
                setIsLoading(false)
              }
            }}
            className="space-y-5"
          >
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold" style={{ color: "var(--on-surface-variant)", letterSpacing: "0.01em" }}>
                  Password
                </Label>
                <a href="#" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>
                  Forgot password?
                </a>
              </div>
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
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" style={{ borderColor: "var(--outline-variant)" }} />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-3 font-medium" style={{ backgroundColor: "var(--background)", color: "var(--on-surface-variant)" }}>
                  Or continue with
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
            New to HiQueue?{" "}
            <Link href="/register" className="font-semibold hover:underline inline-flex items-center gap-1" style={{ color: "var(--primary)" }}>
              Create an account <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Brand Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center px-16 py-12"
        style={{ backgroundColor: "var(--primary-container)" }}
      >
        {/* Soft background gradient blobs */}
        <div className="absolute inset-0">
          <div
            className="absolute top-[-120px] right-[-120px] w-[420px] h-[420px] rounded-full opacity-20"
            style={{
              backgroundColor: "var(--primary)",
              filter: "blur(90px)",
            }}
          />
          <div
            className="absolute bottom-[-120px] left-[-120px] w-[380px] h-[380px] rounded-full opacity-15"
            style={{
              backgroundColor: "var(--tertiary)",
              filter: "blur(80px)",
            }}
          />
        </div>

        {/* Content wrapper */}
        <div className="relative z-10 w-full max-w-xl space-y-10">

          {/* Header */}
          <div className="space-y-5">
            <span
              className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--on-primary)",
              }}
            >
              ✦ Queue Management System
            </span>

            <h2
              className="text-4xl font-bold leading-tight"
              style={{
                color: "var(--on-primary-container)",
                letterSpacing: "-0.03em",
              }}
            >
              Queues can be long, but your waiting time does not have to be.
            </h2>

            <p
              className="text-base leading-relaxed max-w-lg"
              style={{
                color: "var(--on-primary-container)",
                opacity: 0.75,
              }}
            >
              HiQueue reduces queue anxiety by giving real-time clarity to both agents and visitors — making waiting predictable, not stressful.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
