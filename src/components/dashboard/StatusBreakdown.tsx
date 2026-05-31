const STATUS_LABELS: Record<string, string> = {
  waiting: "Waiting",
  serving: "Serving",
  done: "Completed",
  skipped: "Skipped",
  no_show: "No show",
}

const STATUS_COLORS: Record<string, string> = {
  waiting: "bg-amber-500",
  serving: "bg-primary",
  done: "bg-emerald-500",
  skipped: "bg-muted-foreground/50",
  no_show: "bg-destructive/70",
}

interface StatusBreakdownProps {
  statusCounts: Record<string, number>
  total: number
}

export function StatusBreakdown({ statusCounts, total }: StatusBreakdownProps) {
  const entries = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No tickets yet. Activity will appear here once queues are in use.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map(([status, count]) => {
        const pct = Math.round((count / total) * 100)
        return (
          <div key={status} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {STATUS_LABELS[status] ?? status}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {count} ({pct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${STATUS_COLORS[status] ?? "bg-primary"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
