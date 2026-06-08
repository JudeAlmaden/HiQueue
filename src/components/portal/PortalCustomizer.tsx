"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import type {
  OrgPortalContext,
  PortalTheme,
  PortalBranding,
  PortalLayoutSettings,
  PortalLayoutControlSettings,
} from "@/lib/portal-theme"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeSelector } from "./ThemeSelector"
import { CustomColorPicker } from "./CustomColorPicker"
import { Button } from "@/components/ui/button"
import { Save, RotateCcw, X } from "lucide-react"
import { toast } from "sonner"
import { updatePortalTheme, updatePortalBranding } from "@/server/actions/portal.actions"
import { useRouter } from "next/navigation"
import { LayoutDesignControls } from "./customizers/LayoutDesignControls"
import { LoginLayoutCustomizer } from "./customizers/LoginLayoutCustomizer"

interface PortalCustomizerProps {
  orgPortal: OrgPortalContext
  sampleQueueId?: string
}

type CustomizerTab = "theme" | "branding" | "layout"

function LayoutMockPreview({
  section,
  option,
}: {
  section: keyof PortalLayoutSettings
  option: string
}) {
  const frame = "mt-3 rounded-lg border border-border bg-background p-2"
  const topBar = <div className="h-2.5 rounded bg-muted/70" />

  if (section === "login") {
    if (option === "centered") {
      return (
        <div className={frame}>
          <div className="space-y-2">
            {topBar}
            <div className="mx-auto mt-1.5 max-w-[150px] rounded-md border border-border bg-card p-2.5 space-y-1.5">
              <div className="h-2 w-2/3 mx-auto rounded bg-muted/80" />
              <div className="h-1.5 w-1/2 mx-auto rounded bg-muted/60" />
              <div className="h-4 rounded bg-muted/45" />
              <div className="h-4 rounded bg-muted/45" />
              <div className="h-4 rounded bg-primary/30" />
            </div>
          </div>
        </div>
      )
    }
    if (option === "split") {
      return (
        <div className={frame}>
          <div className="space-y-2">
            {topBar}
            <div className="grid h-16 grid-cols-2 gap-1.5">
              <div className="rounded border border-border bg-primary/10 p-1.5 space-y-1">
                <div className="h-1.5 w-2/3 rounded bg-primary/30" />
                <div className="h-1.5 w-full rounded bg-muted/70" />
                <div className="h-1.5 w-4/5 rounded bg-muted/70" />
              </div>
              <div className="rounded border border-border bg-card p-1.5 space-y-1">
                <div className="h-1.5 w-1/2 rounded bg-muted/80" />
                <div className="h-3 rounded bg-muted/50" />
                <div className="h-3 rounded bg-muted/50" />
                <div className="h-3 rounded bg-primary/30" />
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className={frame}>
        <div className="space-y-2">
          {topBar}
          <div className="mx-auto mt-1.5 max-w-[120px] rounded-md border border-border bg-card p-2 space-y-1">
            <div className="h-1.5 w-2/3 rounded bg-muted/80 mx-auto" />
            <div className="h-3 rounded bg-muted/45" />
            <div className="h-3 rounded bg-muted/45" />
            <div className="h-3 rounded bg-primary/30" />
          </div>
        </div>
      </div>
    )
  }

  if (section === "ticketing") {
    if (option === "card") {
      return (
        <div className={frame}>
          <div className="space-y-2">
            {topBar}
            <div className="mx-auto max-w-[150px] rounded-md border border-border bg-card p-2 space-y-1.5">
              <div className="h-2 w-1/2 mx-auto rounded bg-primary/35" />
              <div className="h-1.5 w-3/4 mx-auto rounded bg-muted/60" />
              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-4 rounded bg-muted/45" />
                <div className="h-4 rounded bg-muted/45" />
              </div>
              <div className="h-3 rounded bg-muted/45" />
              <div className="h-3 rounded bg-primary/30" />
            </div>
          </div>
        </div>
      )
    }
    if (option === "split-services") {
      return (
        <div className={frame}>
          <div className="space-y-2">
            {topBar}
            <div className="grid h-16 grid-cols-2 gap-1.5">
              <div className="rounded border border-border bg-card p-1.5 space-y-1">
                <div className="h-1.5 w-2/3 rounded bg-muted/80" />
                <div className="grid grid-cols-2 gap-1">
                  <div className="h-3 rounded bg-muted/50" />
                  <div className="h-3 rounded bg-muted/50" />
                </div>
                <div className="h-3 rounded bg-muted/50" />
              </div>
              <div className="rounded border border-border bg-card p-1.5 space-y-1">
                <div className="h-1.5 w-1/2 rounded bg-muted/80" />
                <div className="h-3 rounded bg-muted/45" />
                <div className="h-3 rounded bg-primary/30" />
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className={frame}>
        <div className="space-y-2">
          {topBar}
          <div className="grid h-16 grid-cols-[1.4fr_1fr] gap-1.5">
            <div className="rounded border border-border bg-card p-1.5 space-y-1">
              <div className="h-1.5 w-1/3 rounded bg-primary/35" />
              <div className="h-1.5 w-2/3 rounded bg-muted/70" />
              <div className="grid grid-cols-3 gap-1">
                <div className="h-3 rounded bg-muted/45" />
                <div className="h-3 rounded bg-muted/45" />
                <div className="h-3 rounded bg-muted/45" />
              </div>
            </div>
            <div className="rounded border border-border bg-surface-container/50 p-1.5 space-y-1">
              <div className="h-1.5 w-1/2 rounded bg-muted/80" />
              <div className="h-3 rounded bg-muted/50" />
              <div className="h-3 rounded bg-primary/30" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (section === "liveDisplay") {
    if (option === "standard") {
      return (
        <div className={frame}>
          <div className="space-y-1.5">
            {/* Header with org name and clock */}
            <div className="flex items-center justify-between px-1">
              <div className="h-2 w-12 rounded bg-muted/80" />
              <div className="h-2 w-10 rounded bg-muted/60" />
            </div>
            {/* Main content grid */}
            <div className="grid h-16 grid-cols-[2fr_1fr] gap-1.5">
              {/* Now Serving - Left side */}
              <div className="rounded border border-border bg-card p-1.5 flex flex-col items-center justify-center space-y-1">
                <div className="h-1.5 w-16 rounded bg-primary/40 mb-0.5" />
                <div className="w-8 h-8 rounded-full border-2 border-muted/40 flex items-center justify-center">
                  <div className="h-1 w-1 rounded-full bg-muted/60" />
                </div>
                <div className="h-1 w-12 rounded bg-muted/50" />
              </div>
              {/* Waiting Queue - Right sidebar */}
              <div className="rounded border border-border bg-card/80 p-1.5 space-y-0.5">
                <div className="h-1.5 w-12 rounded bg-muted/70 mb-1" />
                <div className="h-2.5 rounded bg-muted/40" />
                <div className="h-2.5 rounded bg-muted/40" />
                <div className="h-2.5 rounded bg-muted/40" />
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between px-1">
              <div className="h-1 w-16 rounded bg-primary/30" />
              <div className="h-1 w-12 rounded bg-muted/50" />
            </div>
          </div>
        </div>
      )
    }
    if (option === "no-waiting") {
      return (
        <div className={frame}>
          <div className="space-y-1.5">
            {/* Header with org name and clock */}
            <div className="flex items-center justify-between px-1">
              <div className="h-2 w-12 rounded bg-muted/80" />
              <div className="h-2 w-10 rounded bg-muted/60" />
            </div>
            {/* Full width Now Serving only */}
            <div className="h-16 rounded border border-border bg-card p-2 flex flex-col items-center justify-center space-y-1.5">
              <div className="h-2 w-20 rounded bg-primary/40" />
              <div className="w-10 h-10 rounded-full border-2 border-muted/40 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-muted/60" />
              </div>
              <div className="h-1.5 w-16 rounded bg-muted/50" />
            </div>
            {/* Footer */}
            <div className="flex items-center justify-center px-1">
              <div className="h-1 w-16 rounded bg-primary/30" />
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className={frame}>
        <div className="space-y-2">
          {topBar}
          <div className="h-16 rounded border border-border bg-card p-1.5">
            <div className="h-1.5 w-1/4 rounded bg-muted/80 mb-1" />
            <div className="h-10 rounded bg-muted/45" />
          </div>
        </div>
      </div>
    )
  }

  if (section === "track") {
    if (option === "centered") {
      return (
        <div className={frame}>
          <div className="space-y-2">
            {topBar}
            <div className="mx-auto max-w-[150px] space-y-1">
              <div className="h-5 rounded border border-border bg-card" />
              <div className="h-8 rounded border border-border bg-card" />
              <div className="h-6 rounded border border-border bg-card" />
            </div>
          </div>
        </div>
      )
    }
    if (option === "split") {
      return (
        <div className={frame}>
          <div className="space-y-2">
            {topBar}
            <div className="grid h-16 grid-cols-2 gap-1.5">
              <div className="rounded border border-border bg-card p-1 space-y-1">
                <div className="h-4 rounded bg-muted/45" />
                <div className="h-6 rounded bg-muted/45" />
              </div>
              <div className="rounded border border-border bg-card p-1 space-y-1">
                <div className="h-1.5 w-1/2 rounded bg-muted/80" />
                <div className="h-5 rounded bg-muted/45" />
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className={frame}>
        <div className="space-y-2">
          {topBar}
          <div className="mx-auto max-w-[120px] space-y-1">
            <div className="h-4 rounded border border-border bg-card" />
            <div className="h-6 rounded border border-border bg-card" />
          </div>
        </div>
      </div>
    )
  }

  if (option === "split") {
    return (
      <div className={frame}>
        <div className="grid h-14 grid-cols-2 gap-1.5">
          <div className="rounded bg-muted/70" />
          <div className="rounded bg-muted/45" />
        </div>
      </div>
    )
  }
  if (option === "compact") {
    return (
      <div className={frame}>
        <div className="space-y-1.5">
          <div className="h-2 w-1/2 rounded bg-muted/90" />
          <div className="h-6 rounded bg-muted/60" />
        </div>
      </div>
    )
  }
  return (
    <div className={frame}>
      <div className="space-y-1.5">
        <div className="h-2 w-2/3 rounded bg-muted/90" />
        <div className="h-8 rounded bg-muted/60" />
      </div>
    </div>
  )
}

export function PortalCustomizer({ orgPortal, sampleQueueId }: PortalCustomizerProps) {
  const router = useRouter()
  const [theme, setTheme] = useState<PortalTheme>({
    mode: orgPortal.theme.mode ?? "light",
    ...orgPortal.theme,
  })
  const [branding, setBranding] = useState<PortalBranding>(orgPortal.branding)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isCustomColorModalOpen, setIsCustomColorModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<CustomizerTab>("theme")
  const [layoutCustomizeSection, setLayoutCustomizeSection] = useState<keyof PortalLayoutSettings | null>(null)
  const [layoutPreviewOption, setLayoutPreviewOption] = useState<string | null>(null)
  const [previewZoom, setPreviewZoom] = useState<number>(0.5)

  // Read tab from URL on mount (client-side only)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    if (tab === "theme" || tab === "branding" || tab === "layout") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(tab as CustomizerTab)
    }
  }, [])

  // Update URL when tab changes
  const handleTabChange = (newTab: CustomizerTab) => {
    setActiveTab(newTab)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", newTab)
    window.history.replaceState({}, "", url.toString())
  }

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const [themeResult, brandingResult] = await Promise.all([
        updatePortalTheme(orgPortal.id, theme),
        updatePortalBranding(orgPortal.id, branding),
      ])

      if (themeResult.success && brandingResult.success) {
        toast.success("Portal customization saved successfully!")
        setHasChanges(false)
        router.refresh()
      } else {
        const message = !themeResult.success
          ? themeResult.error
          : !brandingResult.success
            ? brandingResult.error
            : "Failed to save customization"
        toast.error(message)
      }
    } catch (error) {
      toast.error("An error occurred while saving")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }, [orgPortal.id, theme, branding, router])

  const handleReset = () => {
    setTheme({
      mode: orgPortal.theme.mode ?? "light",
      ...orgPortal.theme,
    })
    setBranding(orgPortal.branding)
    setHasChanges(false)
    toast.info("Changes reset to saved values")
  }

  const handleThemeChange = (newTheme: PortalTheme) => {
    setTheme(newTheme)
    setHasChanges(true)
  }

  const handleModeChange = (mode: "light" | "dark") => {
    setTheme((prev) => ({ ...prev, mode }))
    setHasChanges(true)
  }

  const handleLayoutChange = <K extends keyof PortalLayoutSettings>(
    section: K,
    value: NonNullable<PortalLayoutSettings[K]>
  ) => {
    setTheme((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [section]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleLayoutControlChange = (
    section: keyof PortalLayoutControlSettings,
    key: "splitLeftPanelBgImage" | "splitRightPanelBg" | "pageBg" | "pageBgImage" | "typographyScale" | "fontColor" | "sharpness",
    value: string | number | boolean
  ) => {
    setTheme((prev) => ({
      ...prev,
      layoutControls: {
        ...prev.layoutControls,
        [section]: {
          ...(prev.layoutControls?.[section] ?? {}),
          [key]: value,
        },
      },
    }))
    setHasChanges(true)
  }

  // Keyboard shortcuts for modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (layoutCustomizeSection) {
      if (e.key === "Escape") {
        setLayoutCustomizeSection(null)
      } else if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        if (hasChanges && !isSaving) {
          handleSave()
        }
      }
    }
  }, [layoutCustomizeSection, hasChanges, isSaving, handleSave])

  // Attach keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [layoutCustomizeSection, hasChanges, isSaving, handleKeyDown])

  const isCustomTheme = (theme.themeClass ?? "") === "theme-custom"
  const layoutSections = [
    {
      key: "login" as const,
      label: "Portal Login",
      value: theme.layout?.login ?? "centered",
      options: [
        { key: "centered" as const, title: "Centered", description: "Balanced, neutral sign-in experience." },
        { key: "split" as const, title: "Split", description: "Brand story panel + focused form panel." },
        { key: "minimal" as const, title: "Minimal", description: "Compact, distraction-free sign in." },
      ],
    },
    {
      key: "ticketing" as const,
      label: "Live Ticketing",
      value: theme.layout?.ticketing ?? "card",
      options: [
        { key: "card" as const, title: "Card", description: "Single-card kiosk with clear CTA flow." },
        {
          key: "split-services" as const,
          title: "Split Services",
          description: "Service selection and form side-by-side.",
        },
      ],
    },
    {
      key: "liveDisplay" as const,
      label: "Live Display",
      value: theme.layout?.liveDisplay ?? "standard",
      options: [
        { key: "standard" as const, title: "Standard", description: "Now-serving center with waiting queue sidebar." },
        {
          key: "no-waiting" as const,
          title: "Focus",
          description: "Full-screen now-serving, no waiting list shown.",
        },
      ],
    },
    {
      key: "track" as const,
      label: "Where's My Ticket",
      value: theme.layout?.track ?? "centered",
      options: [
        { key: "centered" as const, title: "Centered", description: "Search-first stacked status experience." },
      ],
    },
  ]
  const activeLayoutSection = layoutSections.find((section) => section.key === layoutCustomizeSection) ?? null
  const previewOption =
    activeLayoutSection?.options.find((option) => option.key === layoutPreviewOption) ??
    activeLayoutSection?.options[0]
  const previewThemeParam = encodeURIComponent(JSON.stringify(theme))
  const previewUrl = (() => {
    if (!activeLayoutSection) return null
    if (activeLayoutSection.key === "login") {
      return `/org/${orgPortal.slug}/login?previewTheme=${previewThemeParam}`
    }
    if (!sampleQueueId) return null
    if (activeLayoutSection.key === "liveDisplay") {
      return `/org/${orgPortal.slug}/display/${sampleQueueId}?previewTheme=${previewThemeParam}`
    }
    if (activeLayoutSection.key === "ticketing") {
      return `/live/${sampleQueueId}?previewTheme=${previewThemeParam}`
    }
    return `/live/${sampleQueueId}/track?previewTheme=${previewThemeParam}`
  })()
  const activeControls =
    layoutCustomizeSection && theme.layoutControls
      ? (theme.layoutControls[layoutCustomizeSection] as {
          splitLeftPanelBgImage?: string
          splitRightPanelBg?: string
          pageBg?: string
          pageBgImage?: string
          typographyScale?: number
          fontColor?: string
          sharpness?: number
        })
      : undefined

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Portal Settings</CardTitle>
              <CardDescription>
                Configure layouts for login, ticketing, live display, and track pages.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Customization Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as CustomizerTab)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="space-y-6 mt-6">
          {!isCustomTheme ? (
            <Card>
              <CardHeader>
                <CardTitle>Color Mode</CardTitle>
                <CardDescription>
                  Choose how your organization portal looks in both dashboard and staff portal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                  <Button
                    type="button"
                    variant={(theme.mode ?? "light") === "light" ? "default" : "outline"}
                    onClick={() => handleModeChange("light")}
                  >
                    Light
                  </Button>
                  <Button
                    type="button"
                    variant={theme.mode === "dark" ? "default" : "outline"}
                    onClick={() => handleModeChange("dark")}
                  >
                    Dark
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Color Mode</CardTitle>
                <CardDescription>
                  Custom Colors uses one brand palette across the portal and does not use Light/Dark variants.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          <ThemeSelector
            currentTheme={theme}
            onChange={handleThemeChange}
            onOpenCustomColors={() => setIsCustomColorModalOpen(true)}
          />
        </TabsContent>

        <TabsContent value="branding" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding Customization</CardTitle>
              <CardDescription>
                Enter your logo image URL. This will be used on portal surfaces like login, display, and kiosk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-[1fr_320px]">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-on-surface">Logo URL</div>
                    <div className="text-xs text-on-surface-variant">
                      Enter the URL of your logo image. Recommended: transparent PNG/SVG (square works best).
                    </div>
                    <input
                      value={branding.logoUrl ?? ""}
                      onChange={(e) => {
                        setBranding((prev) => ({ ...prev, logoUrl: e.target.value || undefined }))
                        setHasChanges(true)
                      }}
                      placeholder="https://example.com/logo.png"
                      className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-on-surface">Tagline</div>
                    <input
                      value={branding.tagline ?? ""}
                      onChange={(e) => {
                        setBranding((prev) => ({ ...prev, tagline: e.target.value || undefined }))
                        setHasChanges(true)
                      }}
                      placeholder="Short line under your org name"
                      className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-on-surface">Welcome Message</div>
                    <textarea
                      value={branding.welcomeMessage ?? ""}
                      onChange={(e) => {
                        setBranding((prev) => ({ ...prev, welcomeMessage: e.target.value || undefined }))
                        setHasChanges(true)
                      }}
                      placeholder="Optional message shown on select portal surfaces"
                      className="min-h-[110px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-sm font-semibold text-on-surface">Preview</div>
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-4">
                    <div className="h-12 w-12 rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                      {branding.logoUrl ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={branding.logoUrl}
                            alt="Logo preview"
                            fill
                            className="object-contain"
                            unoptimized={branding.logoUrl.startsWith("http")}
                          />
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold text-muted-foreground">No logo</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-on-surface">{orgPortal.name}</div>
                      <div className="truncate text-xs text-on-surface-variant">
                        {branding.tagline || orgPortal.branding.tagline || "Your tagline will show here"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-on-surface-variant">
                    Logo is loaded from the URL you provide. Make sure it&apos;s publicly accessible.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Options</CardTitle>
              <CardDescription>
                Configure layout presets separately for each public/staff-facing surface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {layoutSections.map((section) => (
                  <div key={section.key} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-on-surface">{section.label}</div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setLayoutCustomizeSection(section.key)
                          setLayoutPreviewOption(section.value)
                        }}
                      >
                        Customize
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {section.options.map((option) => {
                        const active = section.value === option.key
                        return (
                          <div
                            key={option.key}
                            className={`rounded-xl border p-4 text-left transition-colors ${
                              active
                                ? "border-primary bg-primary/10"
                                : "border-border bg-card hover:border-primary/60"
                            }`}
                          >
                            <div className="text-sm font-semibold text-on-surface">{option.title}</div>
                            <p className="mt-1 text-xs text-on-surface-variant">{option.description}</p>
                            <LayoutMockPreview section={section.key} option={option.key} />
                            <div className="mt-3">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleLayoutChange(section.key, option.key)
                                  setLayoutCustomizeSection(section.key)
                                  setLayoutPreviewOption(option.key)
                                }}
                              >
                                Preview
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isCustomColorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close custom colors modal"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsCustomColorModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
              <h3 className="text-sm font-semibold text-on-surface">Customize Colors</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsCustomColorModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <CustomColorPicker
                currentTheme={theme}
                onChange={handleThemeChange}
                orgId={orgPortal.id}
              />
            </div>
          </div>
        </div>
      )}

      {layoutCustomizeSection && activeLayoutSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <button
            type="button"
            aria-label="Close layout customize modal"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setLayoutCustomizeSection(null)}
          />
          <div className="relative z-10 w-full max-w-7xl h-[96vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
            {/* Compact Header */}
            <div className="flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur px-6 py-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-on-surface">{activeLayoutSection.label}</h3>
                <span className="text-xs text-on-surface-variant">• {previewOption?.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setLayoutCustomizeSection(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main Content - Side by Side */}
            <div className="flex-1 flex min-h-0">
              {/* Controls Panel - Left Sidebar (Narrower) */}
              <div className="w-72 border-r border-border bg-card flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">
                      Quick Colors
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleLayoutControlChange(activeLayoutSection.key, "pageBg", theme.cssVars?.["--primary"] || "#4a654e")}
                        className="h-12 flex-1 rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105"
                        style={{ backgroundColor: theme.cssVars?.["--primary"] || "#4a654e" }}
                        title="Primary"
                      />
                      <button
                        type="button"
                        onClick={() => handleLayoutControlChange(activeLayoutSection.key, "pageBg", theme.cssVars?.["--secondary"] || "#586249")}
                        className="h-12 flex-1 rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105"
                        style={{ backgroundColor: theme.cssVars?.["--secondary"] || "#586249" }}
                        title="Secondary"
                      />
                      <button
                        type="button"
                        onClick={() => handleLayoutControlChange(activeLayoutSection.key, "pageBg", theme.cssVars?.["--background"] || "#faf9f6")}
                        className="h-12 flex-1 rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105"
                        style={{ backgroundColor: theme.cssVars?.["--background"] || "#faf9f6" }}
                        title="Light"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">
                      Customize
                    </div>
                    <LayoutDesignControls
                      layoutKey={activeLayoutSection.key}
                      layoutType={previewOption?.key}
                      previewOptionKey={previewOption?.key}
                      activeControls={activeControls}
                      onControlChange={(key, value) =>
                        handleLayoutControlChange(
                          activeLayoutSection.key,
                          key as "splitLeftPanelBgImage" | "splitRightPanelBg" | "pageBg" | "pageBgImage" | "typographyScale" | "fontColor" | "sharpness",
                          value
                        )
                      }
                    />
                    {activeLayoutSection.key === "login" && previewOption?.key === "split" && (
                      <div className="mt-3">
                        <LoginLayoutCustomizer
                          previewOptionKey={previewOption?.key}
                          activeControls={activeControls}
                          onControlChange={(key, value) =>
                            handleLayoutControlChange(
                              activeLayoutSection.key,
                              key as "splitLeftPanelBgImage" | "splitRightPanelBg" | "pageBg" | "pageBgImage" | "typographyScale" | "fontColor" | "sharpness",
                              value
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Panel - Main Area */}
              <div className="flex-1 flex flex-col bg-muted/30 min-w-0">
                {/* Zoom Controls */}
                <div className="flex items-center justify-center gap-2 py-2 px-4 border-b border-border bg-card/50">
                  <span className="text-xs text-on-surface-variant">Zoom:</span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(Math.max(0.5, previewZoom - 0.1))}
                    className="h-7 w-7 rounded-md border border-border hover:bg-surface-container transition-colors flex items-center justify-center text-sm"
                  >
                    −
                  </button>
                  <span className="text-xs font-mono text-on-surface min-w-[3rem] text-center">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(Math.min(1.5, previewZoom + 0.1))}
                    className="h-7 w-7 rounded-md border border-border hover:bg-surface-container transition-colors flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(1)}
                    className="h-7 px-3 rounded-md border border-border hover:bg-surface-container transition-colors text-xs"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-auto flex items-center justify-center">
                  <div style={{
                    width: `${100 / previewZoom}%`,
                    height: `${100 / previewZoom}%`,
                    transform: `scale(${previewZoom})`,
                    transformOrigin: 'center center',
                  }}>
                    <div 
                      className="rounded-xl border-2 border-border bg-white shadow-2xl overflow-hidden"
                      style={{
                        width: '100%',
                        maxWidth: '1440px',
                        height: '700px',
                        aspectRatio: '16 / 9',
                        margin: '0 auto',
                      }}
                    >
                      {previewUrl ? (
                        <iframe
                          title={`${activeLayoutSection.label} preview`}
                          src={previewUrl}
                          className="w-full h-full bg-white"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-sm text-on-surface-variant">
                          Create at least one queue to preview layouts.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 text-xs text-center text-on-surface-variant border-t border-border bg-card/50 py-2">
                  Live preview • Changes apply instantly
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
