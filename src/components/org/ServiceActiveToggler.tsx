"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { setServiceActiveAction } from "@/server/actions/service.action"
import { useToast } from "@/components/ui/toast"
import { Loader2 } from "lucide-react"

interface Service {
  id: string
  name: string
  isActive: boolean
}

interface Props {
  service: Service
  organizationId: string
  orgSlug: string
  queueId: string
  currentUserRole: string
}

export function ServiceActiveToggler({
  service,
  organizationId,
  orgSlug,
  queueId,
  currentUserRole,
}: Props) {
  const router = useRouter()
  const toasts = useToast()
  const [isActive, setIsActive] = useState(service.isActive)
  const [isPending, setIsPending] = useState(false)
  const canOpenService = currentUserRole === "owner"
  const isOpenBlocked = !isActive && !canOpenService

  const handleToggle = async () => {
    if (isPending) return
    const newStatus = !isActive

    if (newStatus && !canOpenService) {
      toasts.error("Only organization owners can reopen services.")
      return
    }

    setIsActive(newStatus)
    setIsPending(true)

    try {
      const res = await setServiceActiveAction({
        id: service.id,
        isActive: newStatus,
        organizationId,
        orgSlug,
        queueId,
      })

      if (res.success) {
        toasts.success(`"${service.name}" is now ${newStatus ? "open" : "closed"}`)
        router.refresh()
      } else {
        setIsActive(!newStatus)
        toasts.error(res.error || "Failed to update service")
      }
    } catch {
      setIsActive(!newStatus)
      toasts.error("An unexpected error occurred.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      role="switch"
      aria-checked={isActive}
      aria-label={`${service.name} - ${isActive ? "open" : "closed"}`}
      onClick={handleToggle}
      disabled={isPending || isOpenBlocked}
      className="group flex items-center gap-2.5 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
          isActive ? "bg-emerald-500" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isActive ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
        {isPending && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-3 w-3 animate-spin text-white" />
          </span>
        )}
      </span>

      <span
        className={`text-xs font-semibold transition-colors ${
          isActive ? "text-emerald-700" : "text-on-surface-variant/60"
        }`}
      >
        {isActive ? "Open" : isOpenBlocked ? "Closed by owner" : "Closed"}
      </span>
    </button>
  )
}
