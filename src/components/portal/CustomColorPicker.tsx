"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ColorPicker } from "./ColorPicker"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { PortalTheme } from "@/lib/portal-theme"
import { AlertCircle, Save } from "lucide-react"
import { updatePortalTheme } from "@/server/actions/portal.actions"
import { toast } from "sonner"

interface CustomColorPickerProps {
  currentTheme: PortalTheme
  onChange: (theme: PortalTheme) => void
  orgId: string
}

interface ColorDefinition {
  key: string
  label: string
  description: string
  defaultLight: string
  defaultDark: string
}

const COLOR_DEFINITIONS: ColorDefinition[] = [
  {
    key: "--primary",
    label: "Primary Color",
    description: "Main brand color for buttons and accents",
    defaultLight: "#4a654e",
    defaultDark: "#b0ceb2",
  },
  {
    key: "--secondary",
    label: "Secondary Color",
    description: "Supporting color for less prominent elements",
    defaultLight: "#586249",
    defaultDark: "#c0caac",
  },
  {
    key: "--background",
    label: "Background Color",
    description: "Main canvas background color",
    defaultLight: "#faf9f6",
    defaultDark: "#111411",
  },
  {
    key: "--surface",
    label: "Surface Color",
    description: "Cards and elevated surface color",
    defaultLight: "#ffffff",
    defaultDark: "#1d201c",
  },
  {
    key: "--on-primary",
    label: "Text on Primary",
    description: "Text color when on primary background",
    defaultLight: "#ffffff",
    defaultDark: "#1c3521",
  },
  {
    key: "--on-secondary",
    label: "Text on Secondary",
    description: "Text color when on secondary background",
    defaultLight: "#ffffff",
    defaultDark: "#2b341e",
  },
]

function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = ((rgb >> 16) & 0xff) / 255
    const g = ((rgb >> 8) & 0xff) / 255
    const b = (rgb & 0xff) / 255

    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    )

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

export function CustomColorPicker({ currentTheme, onChange, orgId }: CustomColorPickerProps) {
  const cssVars = currentTheme.cssVars || {}
  const [isSaving, setIsSaving] = useState(false)

  const handleColorChange = (key: string, value: string) => {
    onChange({
      ...currentTheme,
      cssVars: {
        ...cssVars,
        [key]: value,
      },
    })
  }

  const handleQuickSave = async () => {
    setIsSaving(true)
    try {
      const result = await updatePortalTheme(orgId, currentTheme)
      
      if (result.success) {
        toast.success("Colors saved successfully!")
        // Refresh the page to apply changes
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        toast.error(result.error || "Failed to save colors")
      }
    } catch (error) {
      toast.error("An error occurred while saving")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const primaryColor = cssVars["--primary"] || "#4a654e"
  const onPrimaryColor = cssVars["--on-primary"] || "#ffffff"
  const contrastRatio = getContrastRatio(primaryColor, onPrimaryColor)
  const meetsWCAG = contrastRatio >= 4.5

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Custom Colors</CardTitle>
            <CardDescription>
              Customize individual colors to match your brand. Colors should meet WCAG AA contrast standards (4.5:1 minimum).
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleQuickSave}
            disabled={isSaving}
            className="shrink-0"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Colors"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {COLOR_DEFINITIONS.map((colorDef) => (
            <ColorPicker
              key={colorDef.key}
              label={colorDef.label}
              description={colorDef.description}
              value={cssVars[colorDef.key] || colorDef.defaultLight}
              defaultValue={colorDef.defaultLight}
              onChange={(value) => handleColorChange(colorDef.key, value)}
            />
          ))}
        </div>

        {/* Contrast Checker */}
        <div className={`rounded-lg border p-4 ${meetsWCAG ? "border-primary bg-primary/5" : "border-error bg-error/5"}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`h-5 w-5 mt-0.5 ${meetsWCAG ? "text-primary" : "text-error"}`} />
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {meetsWCAG ? "Contrast Check: Passed ✓" : "Contrast Check: Failed ✗"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Primary/Text contrast ratio: {contrastRatio.toFixed(2)}:1
                {meetsWCAG 
                  ? " (Meets WCAG AA standard)" 
                  : " (Needs at least 4.5:1 for accessibility)"}
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Live Preview</Label>
          <div 
            className="rounded-lg border p-6 space-y-4"
            style={{
              backgroundColor: cssVars["--background"] || "#faf9f6",
            }}
          >
            <div 
              className="rounded-lg p-4 space-y-2"
              style={{
                backgroundColor: cssVars["--surface"] || "#ffffff",
              }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: cssVars["--primary"] || "#4a654e",
                  color: cssVars["--on-primary"] || "#ffffff",
                }}
              >
                Primary Button
              </div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ml-2"
                style={{
                  backgroundColor: cssVars["--secondary"] || "#586249",
                  color: cssVars["--on-secondary"] || "#ffffff",
                }}
              >
                Secondary Button
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
