"use client"

import { useCallback, useRef, useEffect, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface LoginLayoutCustomizerProps {
  previewOptionKey?: string
  activeControls?: {
    splitLeftPanelBgImage?: string
    splitLeftPanelBg?: string
    splitRightPanelBg?: string
  }
  onControlChange: (key: string, value: string | number | boolean) => void
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

export function LoginLayoutCustomizer({ previewOptionKey, activeControls, onControlChange }: LoginLayoutCustomizerProps) {
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

  if (previewOptionKey !== "split") {
    return null
  }

  return (
    <CollapsibleSection title="Split Layout Settings">
      <div className="space-y-4">
        {/* Left Panel */}
        <div className="space-y-3 pb-3 border-b border-border">
          <div className="text-xs font-semibold text-on-surface">Left Panel (Brand)</div>
          
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant">Background Image</label>
            <input
              type="text"
              value={activeControls?.splitLeftPanelBgImage ?? ""}
              onChange={(event) => onControlChange("splitLeftPanelBgImage", event.target.value)}
              placeholder="https://example.com/brand-image.jpg"
              className="h-9 w-full px-2 text-xs rounded border border-border bg-background"
            />
            {activeControls?.splitLeftPanelBgImage && (
              <div className="rounded border border-border bg-muted/20 overflow-hidden h-20">
                <img
                  src={activeControls.splitLeftPanelBgImage}
                  alt="Left panel preview"
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

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant">Overlay Color (optional)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(activeControls?.splitLeftPanelBg ?? "#000000").substring(0, 7)}
                onChange={(event) => {
                  const hex = event.target.value
                  const currentAlpha =
                    (activeControls?.splitLeftPanelBg ?? "#00000000").length === 9
                      ? (activeControls?.splitLeftPanelBg ?? "#00000000").substring(7)
                      : "00"
                  onControlChange("splitLeftPanelBg", hex + currentAlpha)
                }}
                className="h-9 w-14 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={activeControls?.splitLeftPanelBg ?? ""}
                onChange={(event) => onControlChange("splitLeftPanelBg", event.target.value)}
                placeholder="#00000080 (optional)"
                className="h-9 flex-1 px-2 text-xs font-mono rounded border border-border bg-background"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant flex items-center justify-between">
              <span>Overlay Opacity</span>
              <span className="text-xs font-mono text-muted-foreground">
                {(activeControls?.splitLeftPanelBg ?? "#00000000").length === 9
                  ? Math.round(
                      (parseInt((activeControls?.splitLeftPanelBg ?? "#00000000").substring(7, 9), 16) / 255) * 100
                    )
                  : 0}
                %
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={
                (activeControls?.splitLeftPanelBg ?? "#00000000").length === 9
                  ? Math.round(
                      (parseInt((activeControls?.splitLeftPanelBg ?? "#00000000").substring(7, 9), 16) / 255) * 100
                    )
                  : 0
              }
              onChange={(event) => {
                const colorPart = (activeControls?.splitLeftPanelBg ?? "#000000").substring(0, 7)
                const alpha = Math.round((parseInt(event.target.value) / 100) * 255)
                  .toString(16)
                  .padStart(2, "0")
                  .toUpperCase()
                debouncedControlChange("splitLeftPanelBg", colorPart + alpha)
              }}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground">
              Add a color overlay on top of the background image (e.g., for darkening or tinting)
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-on-surface">Right Panel (Form)</div>
          
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(activeControls?.splitRightPanelBg ?? "#f0fdf4").substring(0, 7)}
                onChange={(event) => {
                  const hex = event.target.value
                  const currentAlpha =
                    (activeControls?.splitRightPanelBg ?? "#f0fdf4").length === 9
                      ? (activeControls?.splitRightPanelBg ?? "#f0fdf4").substring(7)
                      : "ff"
                  onControlChange("splitRightPanelBg", hex + currentAlpha)
                }}
                className="h-9 w-14 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={activeControls?.splitRightPanelBg ?? "#f0fdf4"}
                onChange={(event) => onControlChange("splitRightPanelBg", event.target.value)}
                placeholder="#f0fdf4"
                className="h-9 flex-1 px-2 text-xs font-mono rounded border border-border bg-background"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant flex items-center justify-between">
              <span>Opacity</span>
              <span className="text-xs font-mono text-muted-foreground">
                {(activeControls?.splitRightPanelBg ?? "#f0fdf4").length === 9
                  ? Math.round(
                      (parseInt((activeControls?.splitRightPanelBg ?? "#f0fdf4").substring(7, 9), 16) / 255) * 100
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
                (activeControls?.splitRightPanelBg ?? "#f0fdf4").length === 9
                  ? Math.round(
                      (parseInt((activeControls?.splitRightPanelBg ?? "#f0fdf4").substring(7, 9), 16) / 255) * 100
                    )
                  : 100
              }
              onChange={(event) => {
                const colorPart = (activeControls?.splitRightPanelBg ?? "#f0fdf4").substring(0, 7)
                const alpha = Math.round((parseInt(event.target.value) / 100) * 255)
                  .toString(16)
                  .padStart(2, "0")
                  .toUpperCase()
                debouncedControlChange("splitRightPanelBg", colorPart + alpha)
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}
