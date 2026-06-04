"use client"

import { useCallback, useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ChevronDown, ChevronUp } from "lucide-react"

interface LayoutDesignControlsProps {
  layoutKey: string
  layoutType?: string
  previewOptionKey?: string
  activeControls?: {
    splitLeftPanelBgImage?: string
    splitLeftPanelBg?: string
    splitRightPanelBg?: string
    pageBg?: string
    pageBgImage?: string
    typographyScale?: number
    fontColor?: string
    sharpness?: number
  }
  onControlChange: (key: string, value: string | number | boolean) => void
  children?: React.ReactNode
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border border-border bg-surface-container/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-surface-container/50 transition-colors"
      >
        <span className="text-xs font-semibold text-on-surface">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-on-surface-variant" />
        ) : (
          <ChevronDown className="h-4 w-4 text-on-surface-variant" />
        )}
      </button>
      {isOpen && <div className="p-3 pt-0 space-y-3">{children}</div>}
    </div>
  )
}

export function LayoutDesignControls({
  activeControls,
  onControlChange,
  children,
}: LayoutDesignControlsProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Create a debounced version of onControlChange (100ms delay)
  const debouncedControlChange = useCallback(
    (key: string, value: string | number | boolean) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        onControlChange(key, value)
      }, 100)
    },
    [onControlChange]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-3">
      {/* Typography Section */}
      <CollapsibleSection title="Typography & Colors">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant flex items-center justify-between">
              <span>Font Size</span>
              <span className="text-xs font-mono text-muted-foreground">
                {((activeControls?.typographyScale ?? 1) * 100).toFixed(0)}%
              </span>
            </label>
            <input
              type="range"
              min={0.85}
              max={1.25}
              step={0.01}
              value={activeControls?.typographyScale ?? 1}
              onChange={(event) => {
                const value = Number(event.target.value)
                debouncedControlChange("typographyScale", value)
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant">Font Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(activeControls?.fontColor ?? "#1f2937").substring(0, 7)}
                onChange={(event) => {
                  const hex = event.target.value
                  const currentAlpha =
                    (activeControls?.fontColor ?? "#1f2937").length === 9
                      ? (activeControls?.fontColor ?? "#1f2937").substring(7)
                      : "ff"
                  onControlChange("fontColor", hex + currentAlpha)
                }}
                className="h-9 w-14 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={activeControls?.fontColor ?? "#1f2937"}
                onChange={(event) => onControlChange("fontColor", event.target.value)}
                placeholder="#1f2937"
                className="h-9 flex-1 px-2 text-xs font-mono rounded border border-border bg-background"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant flex items-center justify-between">
              <span>Border Radius</span>
              <span className="text-xs font-mono text-muted-foreground">
                {activeControls?.sharpness ?? 12}px
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={24}
              step={1}
              value={activeControls?.sharpness ?? 12}
              onChange={(event) => {
                const value = Number(event.target.value)
                debouncedControlChange("sharpness", value)
              }}
              className="w-full"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Background Section */}
      <CollapsibleSection title="Background">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(activeControls?.pageBg ?? "#f5f5f4").substring(0, 7)}
                onChange={(event) => {
                  const hex = event.target.value
                  const currentAlpha =
                    (activeControls?.pageBg ?? "#f5f5f4").length === 9
                      ? (activeControls?.pageBg ?? "#f5f5f4").substring(7)
                      : "ff"
                  onControlChange("pageBg", hex + currentAlpha)
                }}
                className="h-9 w-14 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={activeControls?.pageBg ?? "#f5f5f4"}
                onChange={(event) => onControlChange("pageBg", event.target.value)}
                placeholder="#f5f5f4"
                className="h-9 flex-1 px-2 text-xs font-mono rounded border border-border bg-background"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant flex items-center justify-between">
              <span>Opacity</span>
              <span className="text-xs font-mono text-muted-foreground">
                {(activeControls?.pageBg ?? "#f5f5f4").length === 9
                  ? Math.round(
                      (parseInt((activeControls?.pageBg ?? "#f5f5f4").substring(7, 9), 16) / 255) * 100
                    )
                  : 100}
                %
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={
                (activeControls?.pageBg ?? "#f5f5f4").length === 9
                  ? Math.round(
                      (parseInt((activeControls?.pageBg ?? "#f5f5f4").substring(7, 9), 16) / 255) * 100
                    )
                  : 100
              }
              onChange={(event) => {
                const colorPart = (activeControls?.pageBg ?? "#f5f5f4").substring(0, 7)
                const alpha = Math.round((parseInt(event.target.value) / 100) * 255)
                  .toString(16)
                  .padStart(2, "0")
                  .toUpperCase()
                debouncedControlChange("pageBg", colorPart + alpha)
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant">Image URL</label>
            <input
              type="text"
              value={activeControls?.pageBgImage ?? ""}
              onChange={(event) => onControlChange("pageBgImage", event.target.value)}
              placeholder="https://example.com/bg.jpg"
              className="h-9 w-full px-2 text-xs rounded border border-border bg-background"
            />
            {activeControls?.pageBgImage && (
              <div className="rounded border border-border bg-muted/20 overflow-hidden h-20">
                <img
                  src={activeControls.pageBgImage}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      parent.innerHTML =
                        '<div class="flex items-center justify-center h-full text-xs text-muted-foreground">Invalid URL</div>'
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Layout-specific children */}
      {children}
    </div>
  )
}
