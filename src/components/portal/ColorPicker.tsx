"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface ColorPickerProps {
  label: string
  description?: string
  value: string
  defaultValue: string
  onChange: (value: string) => void
}

export function ColorPicker({ label, description, value, defaultValue, onChange }: ColorPickerProps) {
  const handleReset = () => {
    onChange(defaultValue)
  }

  const isDefault = value === defaultValue

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor={`color-${label}`} className="text-sm font-medium">
            {label}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {!isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2"
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative">
          <input
            type="color"
            id={`color-picker-${label}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded-md border border-border"
          />
        </div>
        <Input
          type="text"
          id={`color-${label}`}
          value={value}
          onChange={(e) => {
            const val = e.target.value
            if (val.match(/^#[0-9A-Fa-f]{0,6}$/)) {
              onChange(val)
            }
          }}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
          maxLength={7}
        />
      </div>
    </div>
  )
}
