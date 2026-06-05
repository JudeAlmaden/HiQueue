"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { loginUser } from "@/server/actions/auth.action"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/Logo"
import { Globe, GitBranch, ArrowRight, Building2, Loader2 } from "lucide-react"

export function LoginForm() {
  const searchParams = useSearchParams()
  const staffError = searchParams.get("error") === "staff"

  const [error, setError] = useState<string | null>(
    staffError
      ? "Staff accounts cannot use this page. Sign in through your organization's staff portal instead."
      : null
  )
  const [isLoading, setIsLoading] = useState(false)

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

          <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                className="h-11 rounded-full font-medium text-sm border transition-all hover:opacity-80"
                style={{
                  borderColor: "var(--outline-variant)",
                  backgroundColor: "var(--surface-container-low)",
                  color: "var(--on-surface)",
                }}
              >
                <GitBranch className="h-4 w-4 mr-2" /> GitHub
              </Button>
              <Button
                variant="outline"
                type="button"
                className="h-11 rounded-full font-medium text-sm border transition-all hover:opacity-80"
                style={{
                  borderColor: "var(--outline-variant)",
                  backgroundColor: "var(--surface-container-low)",
                  color: "var(--on-surface)",
                }}
              >
                <Globe className="h-4 w-4 mr-2" /> Google
              </Button>
            </div>
          </div>

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
        </div>
      </div>

      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center px-16 py-12"
        style={{ backgroundColor: "var(--surface-container-low)" }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute top-[-120px] right-[-120px] w-[420px] h-[420px] rounded-full opacity-10"
            style={{ backgroundColor: "var(--primary)", filter: "blur(90px)" }}
          />
          <div
            className="absolute bottom-[-120px] left-[-120px] w-[380px] h-[380px] rounded-full opacity-10"
            style={{ backgroundColor: "var(--secondary)", filter: "blur(80px)" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-xl space-y-10">
          <div className="space-y-5">
            <span
              className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
              style={{
                backgroundColor: "var(--secondary-container)",
                color: "var(--on-secondary-container)",
              }}
            >
              Admin dashboard
            </span>
            <h2
              className="text-4xl font-bold leading-tight"
              style={{ color: "var(--on-surface)", letterSpacing: "-0.03em" }}
            >
              Queues can be long, but the wait shouldn&apos;t be.
            </h2>
            <p
              className="text-base leading-relaxed max-w-lg"
              style={{ color: "var(--on-surface-variant)", opacity: 0.85 }}
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
