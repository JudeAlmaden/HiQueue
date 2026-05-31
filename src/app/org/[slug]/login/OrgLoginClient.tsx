"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { loginUser } from "@/server/actions/auth.action"
import { ThemeToggle } from "@/components/theme-toggle"
import { Layers } from "lucide-react"
import type { OrgPortalContext } from "@/lib/portal-theme"

interface OrgLoginClientProps {
  org: OrgPortalContext
  initialError?: string | null
  alreadySignedIn?: boolean
  signedInEmail?: string | null
}

export default function OrgLoginClient({
  org,
  initialError = null,
  alreadySignedIn = false,
  signedInEmail = null,
}: OrgLoginClientProps) {
  const [error, setError] = useState<string | null>(initialError)
  const [isLoading, setIsLoading] = useState(false)

  const tagline =
    org.branding.tagline ?? "Sign in to manage queues for this workspace."

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
            <Layers className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{org.name}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Staff Portal</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg">
              <Layers className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
                Staff portal — not the admin dashboard
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">{org.name}</h1>
              <p className="text-sm text-on-surface-variant mt-1">{tagline}</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container">
              <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
              {org.slug}
            </span>
          </div>

          {alreadySignedIn && (
            <div className="rounded-xl p-4 text-sm bg-primary/10 text-on-surface border border-primary/20 space-y-3">
              <p>
                You&apos;re already signed in
                {signedInEmail ? (
                  <>
                    {" "}
                    as <span className="font-semibold">{signedInEmail}</span>
                  </>
                ) : null}
                .
              </p>
              <Link
                href={`/org/${org.slug}/counter`}
                className="flex w-full h-11 items-center justify-center rounded-full font-semibold text-sm bg-primary text-on-primary hover:opacity-90 transition-opacity"
              >
                Continue to staff portal
              </Link>
            </div>
          )}

          {error && (
            <div className="rounded-xl p-4 text-sm bg-error-container text-on-error-container border border-error">
              {error}
            </div>
          )}

          {alreadySignedIn && (
            <p className="text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Or sign in as a different account
            </p>
          )}

          <form
            action={async (formData) => {
              setIsLoading(true)
              setError(null)
              const res = await loginUser(formData)
              if (res && !res.success) {
                setError(res.error)
                setIsLoading(false)
              }
            }}
            className="space-y-5"
          >
            <input type="hidden" name="orgSlug" value={org.slug} />

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-on-surface-variant">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                className="rounded-xl h-12 text-sm border-0 focus-visible:ring-2 bg-surface-container text-on-surface outline outline-1 outline-outline-variant"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-on-surface-variant">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="rounded-xl h-12 text-sm border-0 focus-visible:ring-2 bg-surface-container text-on-surface outline outline-1 outline-outline-variant"
                required
              />
            </div>

            <Button
              disabled={isLoading}
              type="submit"
              className="w-full h-12 rounded-full font-semibold text-sm bg-primary text-on-primary shadow-lg hover:opacity-90"
            >
              {isLoading ? "Signing in..." : "Sign In to Workspace"}
            </Button>
          </form>

          <p className="text-center text-xs text-on-surface-variant">
            Workspace owner (admin)?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in to the dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
