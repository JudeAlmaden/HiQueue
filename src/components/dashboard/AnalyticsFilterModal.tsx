"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Briefcase, Calendar, Filter, Plus, RotateCcw, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AnalyticsRangeKey } from "@/types/analytics"

interface AnalyticsFilterModalProps {
  ranges: readonly { key: string; label: string }[]
  activeRange: AnalyticsRangeKey
  filterMode: "preset" | "range" | "list"
  selectedDates?: string[]
  startDate?: string
  endDate?: string
  dateLabel?: string
  workingDaysOnly?: boolean
  selectedDaysOfWeek?: number[]
}

const WEEKDAYS = [
  { day: 1, label: "Mon", full: "Monday" },
  { day: 2, label: "Tue", full: "Tuesday" },
  { day: 3, label: "Wed", full: "Wednesday" },
  { day: 4, label: "Thu", full: "Thursday" },
  { day: 5, label: "Fri", full: "Friday" },
  { day: 6, label: "Sat", full: "Saturday" },
  { day: 0, label: "Sun", full: "Sunday" },
]

export function AnalyticsFilterModal({
  ranges,
  activeRange,
  filterMode,
  selectedDates = [],
  startDate: initialStartDate = "",
  endDate: initialEndDate = "",
  dateLabel,
  workingDaysOnly = false,
  selectedDaysOfWeek = [],
}: AnalyticsFilterModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"preset" | "range" | "list">(filterMode)

  // Local state inside modal before user hits Apply
  const [localRange, setLocalRange] = useState<string>(activeRange === "custom" ? "7d" : activeRange)
  const [localFrom, setLocalFrom] = useState<string>(initialStartDate)
  const [localTo, setLocalTo] = useState<string>(initialEndDate)
  const [localDatesList, setLocalDatesList] = useState<string[]>(selectedDates)
  const [dateInputVal, setDateInputVal] = useState<string>("")
  const [localWorkingDays, setLocalWorkingDays] = useState<boolean>(workingDaysOnly)
  const [localDaysOfWeek, setLocalDaysOfWeek] = useState<number[]>(selectedDaysOfWeek)

  // Calculate active filters count
  let activeFilterCount = 0
  if (filterMode === "range" && (initialStartDate || initialEndDate)) activeFilterCount += 1
  if (filterMode === "list" && selectedDates.length > 0) activeFilterCount += 1
  if (workingDaysOnly) activeFilterCount += 1
  if (selectedDaysOfWeek.length > 0) activeFilterCount += 1

  const handleQuickPreset = (presetKey: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("from")
    params.delete("to")
    params.delete("dates")
    params.delete("date")
    params.set("range", presetKey)
    router.push(`/dashboard/analytics?${params.toString()}`)
  }

  const handleAddSpecificDate = (val: string) => {
    if (!val || localDatesList.includes(val)) return
    setLocalDatesList((prev) => [...prev, val].sort())
    setDateInputVal("")
  }

  const handleRemoveSpecificDate = (dStr: string) => {
    setLocalDatesList((prev) => prev.filter((d) => d !== dStr))
  }

  const handleToggleDayOfWeek = (dayNum: number) => {
    setLocalDaysOfWeek((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum].sort()
    )
  }

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("from")
    params.delete("to")
    params.delete("dates")
    params.delete("date")
    params.delete("daysOfWeek")
    params.delete("workingDays")

    if (activeTab === "preset") {
      params.set("range", localRange)
    } else if (activeTab === "range") {
      params.set("range", "custom")
      if (localFrom) params.set("from", localFrom)
      if (localTo) params.set("to", localTo)
    } else if (activeTab === "list") {
      params.set("range", "custom")
      if (localDatesList.length > 0) {
        params.set("dates", localDatesList.join(","))
      }
    }

    if (localWorkingDays) {
      params.set("workingDays", "true")
    } else if (localDaysOfWeek.length > 0) {
      params.set("daysOfWeek", localDaysOfWeek.join(","))
    }

    router.push(`/dashboard/analytics?${params.toString()}`)
    setIsOpen(false)
  }

  const handleResetAll = () => {
    setLocalRange("7d")
    setLocalFrom("")
    setLocalTo("")
    setLocalDatesList([])
    setLocalWorkingDays(false)
    setLocalDaysOfWeek([])

    const params = new URLSearchParams()
    params.set("range", "7d")
    router.push(`/dashboard/analytics?${params.toString()}`)
    setIsOpen(false)
  }

  const formatChipLabel = (dStr: string) => {
    const [y, m, d] = dStr.split("-").map(Number)
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
      new Date(y, m - 1, d)
    )
  }

  return (
    <div className="space-y-3">
      {/* Control Bar: Quick Presets & Filter Modal Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Preset Pills */}
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-surface-low p-1 ring-1 ring-border/60">
          {ranges.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleQuickPreset(item.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterMode === "preset" && item.key === activeRange
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Filter Modal Trigger Button */}
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className={`rounded-xl gap-2 font-semibold ${
            activeFilterCount > 0
              ? "border-primary text-primary bg-primary/5 hover:bg-primary/10"
              : ""
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter Analytics
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-primary text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active Filter Chips Bar */}
      {(dateLabel || workingDaysOnly || selectedDaysOfWeek.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground font-semibold">Active filters:</span>

          {dateLabel && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <Calendar className="h-3 w-3" /> {dateLabel}
            </span>
          )}

          {workingDaysOnly && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
              <Briefcase className="h-3 w-3" /> Mon–Fri only
            </span>
          )}

          {!workingDaysOnly && selectedDaysOfWeek.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-200">
              <Filter className="h-3 w-3" />
              {selectedDaysOfWeek
                .map((d) => WEEKDAYS.find((w) => w.day === d)?.label)
                .filter(Boolean)
                .join(", ")}
            </span>
          )}

          <button
            type="button"
            onClick={handleResetAll}
            className="text-xs text-muted-foreground hover:text-foreground underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ─── MODAL OVERLAY & CARD ──────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface-container/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    Filter Analytics
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Customize timeframe, date range, specific days, and working hours.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Section 1: Date Mode Selector Tabs */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Choose Date Mode
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-muted/60">
                  <button
                    type="button"
                    onClick={() => setActiveTab("preset")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                      activeTab === "preset"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Preset Ranges
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("range")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                      activeTab === "range"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Date Range
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                      activeTab === "list"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Specific Days List
                  </button>
                </div>
              </div>

              {/* Tab 1: Preset Ranges */}
              {activeTab === "preset" && (
                <div className="p-4 bg-surface-container/50 rounded-2xl border border-border space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Select a preset timeframe:
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {ranges.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setLocalRange(r.key)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                          localRange === r.key
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card text-foreground border-border hover:border-primary/40"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Date Range (From -> To) */}
              {activeTab === "range" && (
                <div className="p-4 bg-surface-container/50 rounded-2xl border border-border space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Select start and end dates:
                  </span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase">
                        Start Date (From)
                      </label>
                      <input
                        type="date"
                        value={localFrom}
                        onChange={(e) => setLocalFrom(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase">
                        End Date (To)
                      </label>
                      <input
                        type="date"
                        value={localTo}
                        onChange={(e) => setLocalTo(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Specific Days List */}
              {activeTab === "list" && (
                <div className="p-4 bg-surface-container/50 rounded-2xl border border-border space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Add specific calendar days:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateInputVal}
                      onChange={(e) => setDateInputVal(e.target.value)}
                      className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => handleAddSpecificDate(dateInputVal)}
                      disabled={!dateInputVal}
                      size="sm"
                      className="rounded-xl font-bold gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Day
                    </Button>
                  </div>

                  {localDatesList.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {localDatesList.map((dStr) => (
                        <span
                          key={dStr}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/30"
                        >
                          <Calendar className="h-3 w-3" />
                          {formatChipLabel(dStr)}
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecificDate(dStr)}
                            className="hover:bg-primary/20 p-0.5 rounded-full transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No specific days added yet. Choose a date above and click Add Day.
                    </p>
                  )}
                </div>
              )}

              {/* Section 2: Day of Week Filtering */}
              <div className="space-y-3 pt-2 border-t border-border">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Day of Week Filters
                </label>

                <div className="space-y-3">
                  {/* Working Days Only Quick Toggle */}
                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container/50 border border-border cursor-pointer hover:bg-surface-container transition">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          Working days only (Mon–Fri)
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Automatically exclude Saturday and Sunday tickets
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localWorkingDays}
                      onChange={(e) => {
                        setLocalWorkingDays(e.target.checked)
                        if (e.target.checked) setLocalDaysOfWeek([])
                      }}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                  </label>

                  {/* Individual Day of Week Checkboxes */}
                  {!localWorkingDays && (
                    <div className="space-y-2">
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        Or select specific weekdays:
                      </span>
                      <div className="grid grid-cols-7 gap-1.5">
                        {WEEKDAYS.map((w) => {
                          const isSelected = localDaysOfWeek.includes(w.day)
                          return (
                            <button
                              key={w.day}
                              type="button"
                              onClick={() => handleToggleDayOfWeek(w.day)}
                              className={`py-2 rounded-xl text-xs font-bold transition border text-center ${
                                isSelected
                                  ? "bg-primary/10 text-primary border-primary"
                                  : "bg-card text-muted-foreground border-border hover:text-foreground"
                              }`}
                            >
                              {w.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-container/40">
              <Button
                type="button"
                onClick={handleResetAll}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset all
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleApply}
                  size="sm"
                  className="rounded-xl font-bold px-5"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
