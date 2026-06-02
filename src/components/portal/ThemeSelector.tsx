"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PortalTheme } from "@/lib/portal-theme"
import { Check, SlidersHorizontal, Sparkles } from "lucide-react"

interface ThemeSelectorProps {
  currentTheme: PortalTheme
  onChange: (theme: PortalTheme) => void
  onOpenCustomColors?: () => void
}

interface ThemeOption {
  id: string
  name: string
  description: string
  themeClass: string
  colors: {
    primary: string
    secondary: string
    background: string
  }
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "default",
    name: "Organic Hospitality",
    description: "Light & green, calming botanical tones. Default theme.",
    themeClass: "",
    colors: {
      primary: "#4a654e",
      secondary: "#586249",
      background: "#faf9f6",
    },
  },
  {
    id: "custom",
    name: "Custom Colors Only",
    description: "Use only your custom colors without a pre-built theme.",
    themeClass: "theme-custom",
    colors: {
      primary: "#4a654e",
      secondary: "#586249",
      background: "#faf9f6",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool water-inspired, clinical yet calming.",
    themeClass: "theme-ocean",
    colors: {
      primary: "#0077b6",
      secondary: "#00b4d8",
      background: "#f0f8ff",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm golden hour tones, energetic but comforting.",
    themeClass: "theme-sunset",
    colors: {
      primary: "#e07a5f",
      secondary: "#f4a261",
      background: "#fff5ee",
    },
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    description: "Ultra-accessible, maximum visibility for all users.",
    themeClass: "theme-high-contrast",
    colors: {
      primary: "#ffff00",
      secondary: "#00ffff",
      background: "#000000",
    },
  },
]

export function ThemeSelector({ currentTheme, onChange, onOpenCustomColors }: ThemeSelectorProps) {
  const currentThemeClass = currentTheme.themeClass ?? ""
  const cssVars = currentTheme.cssVars || {}

  const handleThemeSelect = (themeOption: ThemeOption) => {
    // Clear custom CSS vars when selecting a preset theme (not custom)
    const shouldClearVars = themeOption.id !== "custom"
    
    onChange({
      themeClass: themeOption.themeClass || undefined,
      mode: themeOption.id === "custom" ? undefined : currentTheme.mode,
      cssVars: shouldClearVars ? undefined : currentTheme.cssVars,
    })
  }

  // Get custom colors from cssVars or use defaults
  const customColors = {
    primary: cssVars["--primary"] || "#4a654e",
    secondary: cssVars["--secondary"] || "#586249",
    background: cssVars["--background"] || "#faf9f6",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pre-built Themes</CardTitle>
        <CardDescription>
          Select a pre-built theme to quickly brand your portal. You can further customize colors in the next update.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {THEME_OPTIONS.map((themeOption) => {
            const isSelected = currentThemeClass === themeOption.themeClass
            
            // Use actual custom colors for the "custom" theme option
            const displayColors = themeOption.id === "custom" 
              ? customColors 
              : themeOption.colors
            
            const isCustomOption = themeOption.id === "custom"

            return (
              <div
                key={themeOption.id}
                role="button"
                tabIndex={0}
                onClick={() => handleThemeSelect(themeOption)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    handleThemeSelect(themeOption)
                  }
                }}
                className={`group relative flex flex-col gap-3 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : isCustomOption
                      ? "border-dashed border-border bg-card hover:border-primary/50"
                      : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                {/* Color Preview */}
                <div className="flex gap-2">
                  <div
                    className="h-10 w-10 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: displayColors.primary }}
                    title="Primary color"
                  />
                  <div
                    className="h-10 w-10 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: displayColors.secondary }}
                    title="Secondary color"
                  />
                  <div
                    className="h-10 w-10 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: displayColors.background }}
                    title="Background color"
                  />
                </div>

                {/* Theme Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-on-surface">{themeOption.name}</h3>
                    {isCustomOption && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        <Sparkles className="h-3 w-3" />
                        Saved Palette
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {themeOption.description}
                  </p>
                </div>

                {/* Preview Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-medium text-primary">
                    {isSelected ? "Currently active" : "Click to select"}
                  </div>
                  {isCustomOption && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px]"
                      onClick={(event) => {
                        event.stopPropagation()
                        onOpenCustomColors?.()
                      }}
                    >
                      <SlidersHorizontal className="h-3 w-3 mr-1" />
                      Customize
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>


      </CardContent>
    </Card>
  )
}
