"use client"

import { useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Briefcase, Calendar, Plus, RotateCcw, X } from "lucide-react"
import type { AnalyticsRangeKey } from "@/types/analytics"

interface AnalyticsDateFilterProps {
  ranges: readonly { key: string; label: string }[]
  activeRange: AnalyticsRangeKey
  selectedDates?: string[]
  startDate?: string
  endDate?: string
  dateLabel?: string
  workingDaysOnly?: boolean
}

export function AnalyticsDateFilter({
  ranges,
  activeRange,
  selectedDates = [],
  dateLabel,
  workingDaysOnly = false,
}: AnalyticsDateFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pickerValue, setPickerValue] = useState<string>("")

  const updateDatesQuery = (newDates: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("from")
    params.delete("to")
    params.delete("date")
    params.delete("range")

    if (newDates.length > 0) {
      params.set("dates", newDates.join(","))
      params.set("range", "custom")
    } else {
      params.delete("dates")
      params.set("range", "today")
    }
    router.push(`/dashboard/analytics?${params.toString()}`)
  }

  const handleAddDate = (dateToAdd: string) => {
    if (!dateToAdd || selectedDates.includes(dateToAdd)) return
    const updated = [...selectedDates, dateToAdd].sort()
    setPickerValue("")
    updateDatesQuery(updated)
  }

  const handleRemoveDate = (dateToRemove: string) => {
    const updated = selectedDates.filter((d) => d !== dateToRemove)
    updateDatesQuery(updated)
  }

  const handlePresetClick = (rangeKey: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("dates")
    params.delete("from")
    params.delete("to")
    params.delete("date")
    params.set("range", rangeKey)
    router.push(`/dashboard/analytics?${params.toString()}`)
  }

  const handleResetFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("dates")
    params.delete("from")
    params.delete("to")
    params.delete("date")
    params.delete("workingDays")
    params.set("range", "today")
    router.push(`/dashboard/analytics?${params.toString()}`)
  }

  const handleToggleWorkingDays = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (workingDaysOnly) {
      params.delete("workingDays")
    } else {
      params.set("workingDays", "true")
    }
    router.push(`/dashboard/analytics?${params.toString()}`)
  }

  const handleOpenPicker = () => {
    if (inputRef.current) {
      if ("showPicker" in inputRef.current && typeof inputRef.current.showPicker === "function") {
        inputRef.current.showPicker()
      } else {
        inputRef.current.focus()
      }
    }
  }

  const formatChipLabel = (dStr: string) => {
    const [y, m, d] = dStr.split("-").map(Number)
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
      new Date(y, m - 1, d)
    )
  }

  const isCustom = activeRange === "custom" || selectedDates.length > 0

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
      {/* Top Row: Presets & Working Days Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Preset Pills */}
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-muted/60 p-1">
          {ranges.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handlePresetClick(item.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                !isCustom && item.key === activeRange
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Working Days Only Toggle */}
        <button
          type="button"
          onClick={handleToggleWorkingDays}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition ${
            workingDaysOnly
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800 shadow-sm font-bold"
              : "bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>{workingDaysOnly ? "Working days only (Mon–Fri)" : "Include Weekends"}</span>
        </button>
      </div>

      {/* Bottom Row: Multiple Specific Days Selection */}
      <div className="pt-3 border-t border-border/60 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Specific Days:
            </span>

            {/* Date Input with Add button */}
            <div className="relative flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleOpenPicker}
                className="flex items-center gap-1.5 bg-background border border-border hover:border-primary/50 rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground transition shadow-sm"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                <span>Add specific day</span>
              </button>

              <input
                ref={inputRef}
                type="date"
                value={pickerValue}
                onChange={(e) => handleAddDate(e.target.value)}
                className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
              />
            </div>
          </div>

          {(isCustom || workingDaysOnly) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition font-medium"
            >
              <RotateCcw className="h-3 w-3" /> Reset all filters
            </button>
          )}
        </div>

        {/* Selected Dates Chips */}
        {selectedDates.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {selectedDates.map((dStr) => (
              <span
                key={dStr}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/25 shadow-sm"
              >
                <Calendar className="h-3 w-3" />
                {formatChipLabel(dStr)}
                <button
                  type="button"
                  onClick={() => handleRemoveDate(dStr)}
                  title={`Remove ${dStr}`}
                  className="hover:bg-primary/20 p-0.5 rounded-full transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
