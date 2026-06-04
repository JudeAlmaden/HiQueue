"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { loginUser } from "@/server/actions/auth.action"
import { Logo } from "@/components/Logo"
import type { OrgPortalContext } from "@/lib/portal-theme"
import { LoginLayoutShell } from "@/components/portal/layouts/LoginLayouts"
import { useToast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const toasts = useToast()
  const [error, setError] = useState<string | null>(initialError)
  const [isLoading, setIsLoading] = useState(false)
  const logoUrl = org.branding.logoUrl
  const didShowSignedInToast = useRef(false)

  useEffect(() => {
    if (!alreadySignedIn) return
    if (didShowSignedInToast.current) return
    didShowSignedInToast.current = true
    toasts.success(
      <div className="space-y-2">
        <div>
          You are already signed in
          {signedInEmail ? (
            <>
              {" "}
              as <span className="font-semibold">{signedInEmail}</span>
            </>
          ) : null}
          .
        </div>
        <button
          type="button"
          onClick={() => router.push(`/org/${org.slug}/counter`)}
          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-bold text-on-primary shadow-sm hover:opacity-90"
        >
          Continue
        </button>
      </div>,
      12000
    )
  }, [alreadySignedIn, org.slug, router, signedInEmail, toasts])

  const tagline =
    org.branding.tagline ?? "Sign in to manage queues for this workspace."
  const layoutPreset = org.theme.layout?.login ?? "centered"
  const loginControls = org.theme.layoutControls?.login
  const isSplit = layoutPreset === "split"
  const isMinimal = layoutPreset === "minimal"
  const scale = loginControls?.typographyScale ?? 1
  const titleClass = isMinimal ? "text-2xl" : isSplit ? "text-4xl" : "text-3xl"
  const showTopBar = !isMinimal
  const fontColor = loginControls?.fontColor
  const sharpness = loginControls?.sharpness
  const splitLeftPanelBgImage = loginControls?.splitLeftPanelBgImage
  const splitRightPanelBg = loginControls?.splitRightPanelBg

  const themeClass = org.theme.themeClass ?? ""
  const modeClass = themeClass !== "theme-custom" && org.theme.mode === "dark" ? "dark" : ""
  const shouldApplyCustomVars = themeClass === "theme-custom" && org.theme.cssVars
  const themeStyle = shouldApplyCustomVars ? org.theme.cssVars : {}

  // Extract opacity from pageBg for image opacity
  const pageBgOpacity = loginControls?.pageBg && loginControls.pageBg.length === 9
    ? parseInt(loginControls.pageBg.substring(7, 9), 16) / 255
    : 1

  // Build background image with opacity overlay
  const backgroundImageStyle = loginControls?.pageBgImage
    ? `linear-gradient(rgba(0,0,0,${1 - pageBgOpacity}), rgba(0,0,0,${1 - pageBgOpacity})), url(${loginControls.pageBgImage})`
    : undefined

  return (
    <div 
      data-portal-org={org.slug}
      data-portal-org-id={org.id}
      className={`min-h-screen flex flex-col overflow-x-hidden bg-background text-foreground transition-colors duration-200 ${themeClass} ${modeClass}`}
      style={{
        ...themeStyle,
        backgroundColor: loginControls?.pageBg?.substring(0, 7),
        backgroundImage: backgroundImageStyle,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {showTopBar && (
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-border bg-surface/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo variant="icon-only" size="sm" useImage />
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">HiQueue</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Staff portal</p>
            </div>
          </div>
        </div>
      )}

      <div
        className="flex-1 flex w-full overflow-hidden"
        style={{
          color: fontColor,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: "top center",
          ...({
            "--login-radius": sharpness !== undefined ? `${sharpness}px` : undefined,
            "--login-split-left-bg-image": splitLeftPanelBgImage 
              ? `url(${splitLeftPanelBgImage})`
              : undefined,
            "--login-split-left-bg": loginControls?.splitLeftPanelBg,
            "--login-split-right-bg": splitRightPanelBg,
          } as React.CSSProperties),
        }}
      >
        <LoginLayoutShell
          layout={layoutPreset}
          hero={
            isSplit ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Staff Portal Access</p>
                <h2 className="text-4xl font-black tracking-tight text-on-surface">{org.name}</h2>
                <p className="text-on-surface-variant leading-relaxed">{tagline}</p>
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-on-surface" style={{ borderRadius: sharpness !== undefined ? `${sharpness * 0.75}px` : undefined }}>
                  Use your staff account to manage counters, serve tickets, and monitor queue flow.
                </div>
              </div>
            ) : null
          }
          form={
            <div className="space-y-8 w-full">
              {isSplit ? (
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-on-surface">Staff Sign In</h1>
                  <p className="text-sm text-on-surface-variant">Continue to {org.name} workspace.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div 
                    className="flex h-14 w-14 items-center justify-center bg-primary text-on-primary shadow-lg overflow-hidden"
                    style={{ borderRadius: sharpness !== undefined ? `${sharpness * 0.75}px` : "1rem" }}
                  >
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={`${org.name} logo`} className="h-full w-full object-contain bg-white" />
                    ) : (
                      <Layers className="h-7 w-7" />
                    )}
                  </div>
                  <div>
                    <h1 className={`${titleClass} font-bold tracking-tight text-on-surface`}>{org.name}</h1>
                    <p className="text-sm text-on-surface-variant mt-1">{tagline}</p>
                  </div>
                </div>
              )}

              {error && (
                <div 
                  className="p-4 text-sm bg-error-container text-on-error-container border border-error"
                  style={{ borderRadius: sharpness !== undefined ? `${sharpness * 0.75}px` : "0.75rem" }}
                >
                  {error}
                </div>
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
                    className="h-12 text-sm border-0 focus-visible:ring-2 bg-surface-container text-on-surface outline outline-1 outline-outline-variant"
                    style={{ borderRadius: sharpness !== undefined ? `${sharpness * 0.75}px` : undefined }}
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
                    className="h-12 text-sm border-0 focus-visible:ring-2 bg-surface-container text-on-surface outline outline-1 outline-outline-variant"
                    style={{ borderRadius: sharpness !== undefined ? `${sharpness * 0.75}px` : undefined }}
                    required
                  />
                </div>

                <Button
                  disabled={isLoading}
                  type="submit"
                  className="w-full h-12 font-semibold text-sm bg-primary text-on-primary shadow-lg hover:opacity-90 transition-all duration-200"
                  style={{ borderRadius: sharpness !== undefined ? `${sharpness}px` : undefined }}
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
          }
        />
      </div>
    </div>
  )
}
