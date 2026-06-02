"use client"

import { useState } from "react"
import type { OrgPortalContext, PortalTheme, PortalBranding } from "@/lib/portal-theme"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeSelector } from "./ThemeSelector"
import { CustomColorPicker } from "./CustomColorPicker"
import { Button } from "@/components/ui/button"
import { ExternalLink, Save, RotateCcw } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { updatePortalTheme, updatePortalBranding } from "@/server/actions/portal.actions"

interface PortalCustomizerProps {
  orgPortal: OrgPortalContext
}

export function PortalCustomizer({ orgPortal }: PortalCustomizerProps) {
  const [theme, setTheme] = useState<PortalTheme>(orgPortal.theme)
  const [branding, setBranding] = useState<PortalBranding>(orgPortal.branding)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleThemeChange = (newTheme: PortalTheme) => {
    setTheme(newTheme)
    setHasChanges(true)
  }

  const handleBrandingChange = (newBranding: PortalBranding) => {
    setBranding(newBranding)
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
        // Refresh the page to apply changes
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        toast.error(themeResult.error || brandingResult.error || "Failed to save customization")
      }
    } catch (error) {
      toast.error("An error occurred while saving")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setTheme(orgPortal.theme)
    setBranding(orgPortal.branding)
    setHasChanges(false)
    toast.info("Changes reset to saved values")
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Portal Settings</CardTitle>
              <CardDescription>
                Changes will apply to your staff portal at{" "}
                <Link
                  href={`/org/${orgPortal.slug}/login`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-primary hover:underline"
                >
                  /org/{orgPortal.slug}/login
                  <ExternalLink className="h-3 w-3" />
                </Link>
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
      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="space-y-6 mt-6">
          <ThemeSelector
            currentTheme={theme}
            onChange={handleThemeChange}
          />
          <CustomColorPicker
            currentTheme={theme}
            onChange={handleThemeChange}
            orgId={orgPortal.id}
          />
        </TabsContent>

        <TabsContent value="branding" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding Customization</CardTitle>
              <CardDescription>
                Coming soon: Upload your logo, customize welcome messages, and add custom links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                Branding customization features will be available in the next update.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Options</CardTitle>
              <CardDescription>
                Coming soon: Choose layout presets, adjust spacing density, and control animations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                Layout customization features will be available in the next update.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
