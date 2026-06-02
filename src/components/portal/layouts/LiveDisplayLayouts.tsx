import type { ReactNode } from "react"

type DisplayLayout = "standard" | "no-waiting"

interface LiveDisplayLayoutShellProps {
  layout: DisplayLayout
  primary: ReactNode
  waiting?: ReactNode
}

export function LiveDisplayLayoutShell({
  layout,
  primary,
  waiting,
}: LiveDisplayLayoutShellProps) {
  const showWaiting = layout !== "no-waiting"

  if (!showWaiting) {
    return <div className="flex-1 min-h-0">{primary}</div>
  }

  return (
    <div className="flex-1 grid gap-8 min-h-0 grid-cols-12">
      <div className="col-span-8 min-h-0">{primary}</div>
      <div className="col-span-4 min-h-0">
        {waiting}
      </div>
    </div>
  )
}
