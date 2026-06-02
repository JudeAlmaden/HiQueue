import type { ReactNode } from "react"

type TicketingLayout = "card" | "split-services"

interface TicketingLayoutShellProps {
  layout: TicketingLayout
  left: ReactNode
  right: ReactNode
}

export function TicketingLayoutShell({ layout, left, right }: TicketingLayoutShellProps) {
  const rootPadding =
    layout === "split-services" ? "px-6 pb-8" : "px-4 pb-8"

  const cardWidth =
    layout === "split-services" ? "max-w-5xl" : "max-w-2xl"

  return (
    <div className={`flex-1 flex items-center justify-center ${rootPadding} w-full ${cardWidth} mx-auto`}>
      <div
        className={`w-full bg-white overflow-hidden ${
          "rounded-2xl shadow-lg"
        }`}
      >
        {layout === "split-services" ? (
          <div className="p-8 md:p-10 grid gap-8 lg:grid-cols-[1.25fr_0.85fr] items-start">
            <div className="space-y-6">{left}</div>
            <div className="min-h-[260px] space-y-5 rounded-2xl border border-border bg-surface-container/50 p-6 shadow-sm">
              {right}
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-10 space-y-7">
            <div className="space-y-6">{left}</div>
            <div className="space-y-5">{right}</div>
          </div>
        )}
      </div>
    </div>
  )
}
