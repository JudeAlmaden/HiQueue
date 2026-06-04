"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { registerUser } from "@/server/actions/auth.action"
import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/Logo"
import { Globe, Apple, ArrowRight, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Left Panel - Visual/Image Section */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{ 
          backgroundColor: "var(--primary)",
          backgroundImage: "linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)"
        }}
      >
        {/* Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Blob 1 */}
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ 
              backgroundColor: "var(--on-primary)",
              animation: "blob 7s infinite"
            }}
          />
          {/* Blob 2 */}
          <div 
            className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{ 
              backgroundColor: "var(--on-primary)",
              animation: "blob 9s infinite 2s"
            }}
          />
          {/* Blob 3 */}
          <div 
            className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full opacity-25 blur-3xl"
            style={{ 
              backgroundColor: "var(--on-primary)",
              animation: "blob 11s infinite 4s"
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg space-y-6" style={{ color: "var(--on-primary)" }}>
          <h2 className="text-5xl font-bold leading-tight">
            Queues can be long, but the wait shouldn&apos;t be.
          </h2>
          <p className="text-lg leading-relaxed opacity-90">
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
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  style={{ 
                    backgroundColor: "var(--on-primary)",
                    color: "var(--primary)"
                  }}
                >
                  ✓
                </div>
                <span className="text-sm font-medium opacity-90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Blob animation styles */}
        <style jsx>{`
          @keyframes blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
        `}</style>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col space-y-3">
            <Logo useImage />
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
            action={async (formData) => {
              setIsLoading(true)
              setError(null)
              try {
                const res = await registerUser(formData)
                if (res && !res.success) {
                  setError(res.error)
                  setIsLoading(false)
                }
                // If successful, registerUser will redirect (throws NEXT_REDIRECT)
              } catch (error) {
                // redirect() throws a NEXT_REDIRECT error which is expected
                // If it's not a redirect, show error
                if (error && typeof error === 'object' && 'digest' in error) {
                  // This is a Next.js redirect, let it through
                  throw error
                }
                setError("An unexpected error occurred. Please try again.")
                setIsLoading(false)
              }
            }}
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

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                className="h-10 rounded-full font-medium text-sm transition-all"
                style={{ 
                  backgroundColor: "var(--surface-container)",
                  color: "var(--on-surface)",
                  borderColor: "var(--outline-variant)"
                }}
              >
                <Globe className="h-4 w-4 mr-2" /> Google
              </Button>
              <Button
                variant="outline"
                type="button"
                className="h-10 rounded-full font-medium text-sm transition-all"
                style={{ 
                  backgroundColor: "var(--surface-container)",
                  color: "var(--on-surface)",
                  borderColor: "var(--outline-variant)"
                }}
              >
                <Apple className="h-4 w-4 mr-2" /> Apple
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
