"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { registerUser } from "@/server/actions/auth.action"
import { useState } from "react"
import Link from "next/link"
import { Logo } from "@/components/Logo"
import { ArrowRight, Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    registerUser(formData).then((res) => {
      if (res && !res.success) {
        setError(res.error)
        setIsLoading(false)
      }
      // If successful, registerUser will redirect
    }).catch((error) => {
      if (error && typeof error === 'object' && 'digest' in error) {
        throw error
      }
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    })
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
      {/* Left Panel - Visual/Image Section */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/bg2.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(20, 50, 35, 0.75)" }} />

        {/* Content */}
        <div className="relative z-10 max-w-lg space-y-6 text-white">
          <h2 className="text-5xl font-bold leading-tight">
            Queues can be long, but the wait shouldn&apos;t be.
          </h2>
          <p className="text-lg leading-relaxed text-white/90">
            Experience the art of managing your time without the stress of standing in line.
          </p>
          
          {/* Feature list */}
          <div className="space-y-3 pt-4">
            {[
              "Real-time queue management",
              "Multi-service support",
              "Staff portal & analytics"
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div 
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-white/20 text-white"
                >
                  ✓
                </div>
                <span className="text-sm font-medium text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col space-y-3">
            <Logo />
            <h1 
              className="text-3xl font-bold leading-tight"
              style={{ color: "var(--on-surface)" }}
            >
              Create your account
            </h1>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: "var(--on-surface-variant)" }}
            >
              Step into a world of managed moments and calm queues.
            </p>
          </div>

          {error && (
            <div 
              className="rounded-xl p-3 text-sm"
              style={{ 
                backgroundColor: "var(--error-container)",
                color: "var(--on-error-container)"
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label 
                htmlFor="name"
                className="text-sm font-medium"
                style={{ color: "var(--on-surface-variant)" }}
              >
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                className="rounded-xl h-11 text-sm border-0"
                style={{ 
                  backgroundColor: "var(--surface-container)",
                  color: "var(--on-surface)"
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="email"
                className="text-sm font-medium"
                style={{ color: "var(--on-surface-variant)" }}
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                className="rounded-xl h-11 text-sm border-0"
                style={{ 
                  backgroundColor: "var(--surface-container)",
                  color: "var(--on-surface)"
                }}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label 
                  htmlFor="password"
                  className="text-sm font-medium"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl h-11 text-sm border-0"
                  style={{ 
                    backgroundColor: "var(--surface-container)",
                    color: "var(--on-surface)"
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl h-11 text-sm border-0"
                  style={{ 
                    backgroundColor: "var(--surface-container)",
                    color: "var(--on-surface)"
                  }}
                  required
                />
              </div>
            </div>

            <Button
              disabled={isLoading}
              type="submit"
              className="w-full h-11 rounded-full font-semibold text-sm transition-all disabled:opacity-70"
              style={{ 
                backgroundColor: "var(--primary)",
                color: "var(--on-primary)"
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p 
            className="text-center text-sm"
            style={{ color: "var(--on-surface-variant)" }}
          >
            Already have an account?{" "}
            <Link 
              href="/login"
              className="font-semibold hover:underline"
              style={{ color: "var(--primary)" }}
            >
              Sign in
            </Link>
          </p>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span 
                  className="w-full border-t"
                  style={{ borderColor: "var(--outline-variant)" }}
                />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span 
                  className="px-3 font-medium"
                  style={{ 
                    backgroundColor: "var(--background)",
                    color: "var(--on-surface-variant)"
                  }}
                >
                  Or register with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                type="button"
                disabled={isGoogleLoading}
                onClick={() => {
                  setIsGoogleLoading(true)
                  signIn("google", { callbackUrl: "/dashboard" })
                }}
                className="h-10 rounded-full font-medium text-sm transition-all disabled:opacity-70"
                style={{ 
                  backgroundColor: "var(--surface-container)",
                  color: "var(--on-surface)",
                  borderColor: "var(--outline-variant)"
                }}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
