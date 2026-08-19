"use client"

import type { HourlyVolumeItem, PeakHourInfo } from "@/types/analytics"

interface HourlyVolumeChartProps {
  hourlyVolume: HourlyVolumeItem[]
  peakHour: PeakHourInfo | null
  totalTickets: number
}

export function HourlyVolumeChart({ hourlyVolume, peakHour, totalTickets }: HourlyVolumeChartProps) {
  if (totalTickets === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No ticket activity in this range yet to display hourly volume.
      </div>
    )
  }

  // Display hours between 7 AM (7) and 8 PM (20) by default, unless there is activity outside that window
  const activeHours = hourlyVolume.filter((h) => h.count > 0).map((h) => h.hour)
  const minHour = activeHours.length > 0 ? Math.min(7, Math.min(...activeHours)) : 7
  const maxHour = activeHours.length > 0 ? Math.max(20, Math.max(...activeHours)) : 20

  const visibleVolume = hourlyVolume.filter((h) => h.hour >= minHour && h.hour <= maxHour)
  const maxCount = Math.max(1, ...visibleVolume.map((h) => h.count))

  return (
    <div className="space-y-4">
      {peakHour && peakHour.count > 0 && (
        <div className="flex items-center justify-between text-xs bg-primary/10 text-primary border border-primary/20 px-3.5 py-2 rounded-xl">
          <span className="font-semibold">🔥 Peak Activity</span>
          <span className="font-mono font-bold">
            {peakHour.label} ({peakHour.count} {peakHour.count === 1 ? "ticket" : "tickets"})
          </span>
        </div>
      )}

      <div className="relative pt-6 pb-2">
        <div className="flex items-end gap-1.5 sm:gap-2 h-44 px-1">
          {visibleVolume.map((item) => {
            const heightPct = (item.count / maxCount) * 100
            const isPeak = peakHour && item.count === peakHour.count && item.count > 0

            return (
              <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Count tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 text-[10px] font-bold font-mono bg-foreground text-background px-1.5 py-0.5 rounded shadow pointer-events-none z-10 whitespace-nowrap">
                  {item.label}: {item.count}
                </div>

                {/* Bar */}
                <div className="w-full bg-muted/40 rounded-t-md h-full flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isPeak
                        ? "bg-primary shadow-sm shadow-primary/30"
                        : item.count > 0
                        ? "bg-primary/60 hover:bg-primary/80"
                        : "bg-muted-foreground/15"
                    }`}
                    style={{ height: `${Math.max(item.count > 0 ? 8 : 2, heightPct)}%` }}
                  />
                </div>

                {/* Label */}
                <span className="text-[10px] text-muted-foreground font-mono truncate w-full text-center">
                  {item.label.replace(" ", "")}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
