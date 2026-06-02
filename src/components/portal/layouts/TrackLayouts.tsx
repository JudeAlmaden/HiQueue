import type { ReactNode } from "react"

type TrackLayout = "centered" | "split" | "compact"

interface TrackLayoutShellProps {
  layout: TrackLayout
  search: ReactNode
  status?: ReactNode
  help: ReactNode
}

export function TrackLayoutShell({ layout, search, status, help }: TrackLayoutShellProps) {
  const contentWidth = layout === "compact" ? "max-w-xl" : layout === "split" ? "max-w-6xl" : "max-w-2xl"

  if (layout === "split") {
    return (
      <div className={`${contentWidth} mx-auto grid gap-8 lg:grid-cols-2`}>
        <div className="space-y-8">
          {search}
          {status}
        </div>
        <div>{help}</div>
      </div>
    )
  }

  return (
    <div className={`${contentWidth} mx-auto space-y-8`}>
      {search}
      {status}
      {help}
    </div>
  )
}
