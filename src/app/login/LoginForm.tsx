"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { loginUser } from "@/server/actions/auth.action"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Logo } from "@/components/Logo"
import { ArrowRight, Building2, Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"

export function LoginForm() {
  const searchParams = useSearchParams()
  const staffError = searchParams.get("error") === "staff"
  const oauthError = searchParams.get("error")

  const getInitialError = () => {
    if (staffError) return "Staff accounts cannot use this page. Sign in through your organization's staff portal instead."
    if (oauthError === "OAuthAccountNotLinked") return "This email is already registered with a different sign-in method. Please use your original login method."
    if (oauthError === "OAuthCallbackError") return "Google sign-in was cancelled or failed. Please try again."
    if (oauthError === "AccessDenied") return "Access denied. Your account may be inactive."
    if (oauthError && oauthError !== "staff") return "Sign-in failed. Please try again."
    return null
  }

  const [error, setError] = useState<string | null>(getInitialError())
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    // Call the server action
    loginUser(formData).then((res) => {
      if (res && !res.success) {
        setError(res.error)
        setIsLoading(false)
      }
      // If successful, loginUser will redirect
    }).catch((error) => {
      if (error && typeof error === 'object' && 'digest' in error) {
        // This is a Next.js redirect, let it through
        throw error
      }
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    })
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--background)", color: "var(--on-surface)" }}
    >
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col space-y-3">
            <Logo />
            <span
              className="inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "var(--secondary-container)",
                color: "var(--on-secondary-container)",
              }}
            >
              Workspace owner sign in
            </span>
            <h1
              className="text-4xl font-bold tracking-tight leading-tight"
              style={{ color: "var(--on-surface)", letterSpacing: "-0.02em" }}
            >
              Welcome back
            </h1>
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--on-surface-variant)" }}
            >
              For admins who created a HiQueue workspace. Manage your organization from the
              dashboard.
            </p>
          </div>

          <div
            className="flex gap-3 rounded-xl p-4 text-sm"
            style={{
              backgroundColor: "var(--surface-container-low)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <Building2
              className="h-5 w-5 shrink-0 mt-0.5"
              style={{ color: "var(--primary)" }}
            />
            <div>
              <p className="font-semibold" style={{ color: "var(--on-surface)" }}>
                Staff member?
              </p>
              <p className="mt-1" style={{ color: "var(--on-surface-variant)" }}>
                Do not use this page. Your administrator will give you a link like{" "}
                <span className="font-mono text-xs">/org/your-workspace/login</span>.
              </p>
            </div>
          </div>

          {error && (
            <div
              className="rounded-xl p-4 text-sm"
              style={{
                backgroundColor: "var(--error-container)",
                color: "var(--on-error-container)",
                border: "1px solid var(--error)",
              }}
            >
              {error}
            </div>
          )}

          {process.env.NODE_ENV !== "production" && (
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold"
                  style={{ color: "var(--on-surface-variant)", letterSpacing: "0.01em" }}
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  className="rounded-xl h-12 text-sm border-0 focus-visible:ring-2 transition-all"
                  style={{
                    backgroundColor: "var(--surface-container)",
                    color: "var(--on-surface)",
                    outline: "1px solid var(--outline-variant)",
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold"
                    style={{ color: "var(--on-surface-variant)", letterSpacing: "0.01em" }}
                  >
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-xs font-semibold hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl h-12 text-sm border-0 focus-visible:ring-2 transition-all"
                  style={{
                    backgroundColor: "var(--surface-container)",
                    color: "var(--on-surface)",
                    outline: "1px solid var(--outline-variant)",
                  }}
                  required
                />
              </div>

              <Button
                disabled={isLoading}
                type="submit"
                className="w-full h-12 rounded-full font-semibold text-sm transition-all shadow-lg hover:opacity-90 disabled:opacity-70"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--on-primary)",
                  boxShadow: "0 4px 14px rgba(44,74,62,0.3)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in to dashboard"
                )}
              </Button>
            </form>
          )}

          <div className="space-y-4">
            {process.env.NODE_ENV !== "production" && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span
                    className="w-full border-t"
                    style={{ borderColor: "var(--outline-variant)" }}
                  />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span
                    className="px-3 font-medium"
                    style={{
                      backgroundColor: "var(--background)",
                      color: "var(--on-surface-variant)",
                    }}
                  >
                    Or continue with
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                type="button"
                disabled={isGoogleLoading}
                onClick={() => {
                  setIsGoogleLoading(true)
                  signIn("google", { callbackUrl: "/dashboard" })
                }}
                className="h-11 rounded-full font-medium text-sm border transition-all hover:opacity-80 disabled:opacity-70"
                style={{
                  borderColor: "var(--outline-variant)",
                  backgroundColor: "var(--surface-container-low)",
                  color: "var(--on-surface)",
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

          {process.env.NODE_ENV !== "production" && (
            <p className="text-center text-sm" style={{ color: "var(--on-surface-variant)" }}>
              New to HiQueue?{" "}
              <Link
                href="/register"
                className="font-semibold hover:underline inline-flex items-center gap-1"
                style={{ color: "var(--primary)" }}
              >
                Create workspace account <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          )}
        </div>
      </div>

      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center px-16 py-12"
        style={{ backgroundColor: "var(--surface-container-low)" }}
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(20, 50, 35, 0.75)" }} />

        <div className="relative z-10 w-full max-w-xl space-y-10">
          <div className="space-y-5">
            <span
              className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "#fff",
                backdropFilter: "blur(4px)",
              }}
            >
              Admin dashboard
            </span>
            <h2
              className="text-4xl font-bold leading-tight text-white"
              style={{ letterSpacing: "-0.03em" }}
            >
              Queues can be long, but the wait shouldn&apos;t be.
            </h2>
            <p
              className="text-base leading-relaxed max-w-lg text-white"
            >
              This login is only for workspace owners. Staff use a separate portal branded for
              your organization.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
