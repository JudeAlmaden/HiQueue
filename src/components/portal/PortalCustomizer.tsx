"use client"

import { useState } from "react"
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
          <div className="space-y-2">
            {topBar}
            <div className="grid h-16 grid-cols-3 gap-1.5">
              <div className="col-span-2 rounded border border-border bg-card p-1.5">
                <div className="h-1.5 w-1/4 rounded bg-muted/80 mb-1" />
                <div className="h-10 rounded bg-muted/45" />
              </div>
              <div className="space-y-1">
                <div className="h-7 rounded border border-border bg-card p-1" />
                <div className="h-8 rounded border border-border bg-card p-1" />
              </div>
            </div>
          </div>
        </div>
      )
    }
    if (option === "ads") {
      return (
        <div className={frame}>
          <div className="space-y-2">
            {topBar}
            <div className="grid h-16 grid-cols-3 gap-1.5">
              <div className="col-span-2 rounded border border-border bg-card p-1.5">
                <div className="h-1.5 w-1/4 rounded bg-muted/80 mb-1" />
                <div className="h-10 rounded bg-muted/45" />
              </div>
              <div className="rounded border border-border bg-primary/10 p-1.5 space-y-1">
                <div className="h-1.5 w-2/3 rounded bg-primary/35" />
                <div className="h-7 rounded bg-muted/40" />
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
    key: "splitRightPanelBg" | "pageBg" | "pageBgImage" | "useThemeDefault" | "typographyScale" | "fontColor" | "sharpness",
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

  const handleSave = async () => {
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
  }

  const handleReset = () => {
    setTheme({
      mode: orgPortal.theme.mode ?? "light",
      ...orgPortal.theme,
    })
    setBranding(orgPortal.branding)
    setHasChanges(false)
    toast.info("Changes reset to saved values")
  }

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
        { key: "standard" as const, title: "Standard", description: "Now-serving board with waiting column." },
        {
          key: "no-waiting" as const,
          title: "Focus",
          description: "Now-serving only, optimized for distance.",
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
          splitRightPanelBg?: string
          pageBg?: string
          pageBgImage?: string
          useThemeDefault?: boolean
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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CustomizerTab)} className="w-full">
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
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={branding.logoUrl} alt="Logo preview" className="h-full w-full object-contain" />
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
                    Logo is loaded from the URL you provide. Make sure it's publicly accessible.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close layout customize modal"
            className="absolute inset-0 bg-black/60"
            onClick={() => setLayoutCustomizeSection(null)}
          />
          <div className="relative z-10 w-full max-w-[96vw] xl:max-w-[1600px] h-[95vh] flex flex-col rounded-xl border border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-on-surface">{activeLayoutSection.label} Customization</h3>
                <p className="text-xs text-on-surface-variant">
                  Preview and apply layout instantly. Save when you are satisfied.
                </p>
              </div>
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

            <div className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8 min-w-0">
              <div className="rounded-xl border border-border bg-card p-4 md:p-5 min-w-0">
                <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Live Preview</div>
                {previewOption ? (
                  <>
                    <div className="text-sm font-semibold text-on-surface">{previewOption.title}</div>
                    <p className="text-xs text-on-surface-variant mt-1">{previewOption.description}</p>
                    <div className="mt-4 rounded-lg border border-border bg-muted/20 overflow-hidden">
                      {previewUrl ? (
                        <iframe
                          title={`${activeLayoutSection.label} preview`}
                          src={previewUrl}
                          className="w-full bg-white"
                          style={{ height: 'calc(95vh - 400px)', minHeight: '450px' }}
                        />
                      ) : (
                        <div className="p-6 text-sm text-on-surface-variant">
                          Create at least one queue to preview ticketing, display, and track layouts.
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
                <p className="mt-4 text-xs text-on-surface-variant">
                  This preview updates immediately as you switch variants. Save once you are happy.
                </p>

                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                      Design Controls
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeControls?.useThemeDefault ?? false}
                        onChange={(event) =>
                          handleLayoutControlChange(
                            activeLayoutSection.key,
                            "useThemeDefault",
                            event.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="text-xs font-medium text-on-surface">Use Theme Default</span>
                    </label>
                  </div>

                  {!activeControls?.useThemeDefault && (
                    <div className="space-y-4">
                      {/* Typography & Colors Section */}
                      <div className="rounded-lg border border-border bg-surface-container/30 p-3 space-y-3">
                        <div className="text-xs font-semibold text-on-surface">Typography & Colors</div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs text-on-surface-variant">Font Size</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0.85}
                                max={1.25}
                                step={0.01}
                                value={activeControls?.typographyScale ?? 1}
                                onChange={(event) =>
                                  handleLayoutControlChange(
                                    activeLayoutSection.key,
                                    "typographyScale",
                                    Number(event.target.value)
                                  )
                                }
                                className="flex-1"
                              />
                              <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                                {((activeControls?.typographyScale ?? 1) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs text-on-surface-variant">Font Color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={(activeControls?.fontColor ?? "#1f2937").substring(0, 7)}
                                onChange={(event) => {
                                  const hex = event.target.value
                                  const currentAlpha = (activeControls?.fontColor ?? "#1f2937").length === 9 
                                    ? (activeControls?.fontColor ?? "#1f2937").substring(7) 
                                    : "ff"
                                  handleLayoutControlChange(activeLayoutSection.key, "fontColor", hex + currentAlpha)
                                }}
                                className="h-8 w-12 rounded border border-border cursor-pointer"
                              />
                              <input
                                type="text"
                                value={activeControls?.fontColor ?? "#1f2937"}
                                onChange={(event) =>
                                  handleLayoutControlChange(activeLayoutSection.key, "fontColor", event.target.value)
                                }
                                placeholder="#1f2937ff"
                                className="h-8 flex-1 px-2 text-xs font-mono rounded border border-border bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Background Section */}
                      <div className="rounded-lg border border-border bg-surface-container/30 p-3 space-y-3">
                        <div className="text-xs font-semibold text-on-surface">Background</div>
                        
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-xs text-on-surface-variant">Background Color</label>
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <input
                                  type="color"
                                  value={(activeControls?.pageBg ?? "#f5f5f4").substring(0, 7)}
                                  onChange={(event) => {
                                    const hex = event.target.value
                                    const currentAlpha = (activeControls?.pageBg ?? "#f5f5f4").length === 9 
                                      ? (activeControls?.pageBg ?? "#f5f5f4").substring(7) 
                                      : "ff"
                                    handleLayoutControlChange(activeLayoutSection.key, "pageBg", hex + currentAlpha)
                                  }}
                                  className="h-8 w-16 rounded border border-border cursor-pointer"
                                />
                              </div>
                              <input
                                type="text"
                                value={activeControls?.pageBg ?? "#f5f5f4"}
                                onChange={(event) =>
                                  handleLayoutControlChange(activeLayoutSection.key, "pageBg", event.target.value)
                                }
                                placeholder="#f5f5f4 or #f5f5f4ff"
                                className="h-8 flex-1 px-2 text-xs font-mono rounded border border-border bg-background"
                              />
                              <div className="flex items-center gap-1">
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={
                                    (activeControls?.pageBg ?? "#f5f5f4").length === 9
                                      ? Math.round((parseInt((activeControls?.pageBg ?? "#f5f5f4").substring(7), 16) / 255) * 100)
                                      : 100
                                  }
                                  onChange={(event) => {
                                    const hex = (activeControls?.pageBg ?? "#f5f5f4").substring(0, 7)
                                    const alpha = Math.round((Number(event.target.value) / 100) * 255).toString(16).padStart(2, "0")
                                    handleLayoutControlChange(activeLayoutSection.key, "pageBg", hex + alpha)
                                  }}
                                  className="w-20"
                                  title="Opacity"
                                />
                                <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                                  {(activeControls?.pageBg ?? "#f5f5f4").length === 9
                                    ? Math.round((parseInt((activeControls?.pageBg ?? "#f5f5f4").substring(7), 16) / 255) * 100)
                                    : 100}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs text-on-surface-variant">Background Image</label>
                            <div className="space-y-2">
                              <div className="flex items-stretch gap-2">
                                <input
                                  type="text"
                                  value={activeControls?.pageBgImage ?? ""}
                                  onChange={(event) =>
                                    handleLayoutControlChange(activeLayoutSection.key, "pageBgImage", event.target.value)
                                  }
                                  placeholder="https://example.com/image.jpg"
                                  className="h-8 flex-1 px-2 text-xs rounded border border-border bg-background"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3"
                                  onClick={() => {
                                    toast.info("Background image upload coming soon")
                                  }}
                                >
                                  Upload
                                </Button>
                              </div>
                              {activeControls?.pageBgImage && (
                                <div className="rounded border border-border bg-muted/20 p-2 relative overflow-hidden h-24">
                                  <img 
                                    src={activeControls.pageBgImage} 
                                    alt="Background preview" 
                                    className="w-full h-full object-cover rounded"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-xs text-muted-foreground">Invalid image URL</div>'
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shape & Layout Section */}
                      <div className="rounded-lg border border-border bg-surface-container/30 p-3 space-y-3">
                        <div className="text-xs font-semibold text-on-surface">Shape & Layout</div>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs text-on-surface-variant">Border Radius</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={24}
                              step={1}
                              value={activeControls?.sharpness ?? 12}
                              onChange={(event) =>
                                handleLayoutControlChange(activeLayoutSection.key, "sharpness", Number(event.target.value))
                              }
                              className="flex-1"
                            />
                            <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                              {activeControls?.sharpness ?? 12}px
                            </span>
                          </div>
                        </div>

                        {activeLayoutSection.key === "login" && (
                          <div className="space-y-1.5">
                            <label className="text-xs text-on-surface-variant">Split Panel Background</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={(activeControls?.splitRightPanelBg ?? "#f0fdf4").substring(0, 7)}
                                onChange={(event) => {
                                  const hex = event.target.value
                                  const currentAlpha = (activeControls?.splitRightPanelBg ?? "#f0fdf4").length === 9 
                                    ? (activeControls?.splitRightPanelBg ?? "#f0fdf4").substring(7) 
                                    : "ff"
                                  handleLayoutControlChange(activeLayoutSection.key, "splitRightPanelBg", hex + currentAlpha)
                                }}
                                className="h-8 w-16 rounded border border-border cursor-pointer"
                              />
                              <input
                                type="text"
                                value={activeControls?.splitRightPanelBg ?? "#f0fdf4"}
                                onChange={(event) =>
                                  handleLayoutControlChange(activeLayoutSection.key, "splitRightPanelBg", event.target.value)
                                }
                                placeholder="#f0fdf4ff"
                                className="h-8 flex-1 px-2 text-xs font-mono rounded border border-border bg-background"
                              />
                              <div className="flex items-center gap-1">
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={
                                    (activeControls?.splitRightPanelBg ?? "#f0fdf4").length === 9
                                      ? Math.round((parseInt((activeControls?.splitRightPanelBg ?? "#f0fdf4").substring(7), 16) / 255) * 100)
                                      : 100
                                  }
                                  onChange={(event) => {
                                    const hex = (activeControls?.splitRightPanelBg ?? "#f0fdf4").substring(0, 7)
                                    const alpha = Math.round((Number(event.target.value) / 100) * 255).toString(16).padStart(2, "0")
                                    handleLayoutControlChange(activeLayoutSection.key, "splitRightPanelBg", hex + alpha)
                                  }}
                                  className="w-16"
                                  title="Opacity"
                                />
                                <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                                  {(activeControls?.splitRightPanelBg ?? "#f0fdf4").length === 9
                                    ? Math.round((parseInt((activeControls?.splitRightPanelBg ?? "#f0fdf4").substring(7), 16) / 255) * 100)
                                    : 100}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeControls?.useThemeDefault && (
                    <div className="rounded-lg border border-muted bg-muted/20 p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Using theme defaults. Uncheck "Use Theme Default" to customize.
                      </p>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLayoutCustomizeSection(null)}
                  >
                    Close Preview
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
