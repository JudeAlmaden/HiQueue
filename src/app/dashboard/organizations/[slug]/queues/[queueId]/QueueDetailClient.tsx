"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Key, Info, ListOrdered, Loader2, Power, PowerOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { setQueueActiveAction } from "@/server/actions/queue.action"
import { EditQueueForm } from "@/components/queues/EditQueueForm"
import { DeleteQueueDialog } from "@/components/queues/DeleteQueueDialog"
import { ServiceList } from "@/components/services/ServiceList"
import { CounterList } from "@/components/counters/CounterList"

interface Props {
  queue: any
  currentUserRole: string
  organizationId: string
  orgSlug: string
  organizationMembers: Array<{
    id: string
    name: string | null
    email: string | null
    role: string
  }>
}

export function QueueDetailClient({ queue, currentUserRole, organizationId, orgSlug, organizationMembers }: Props) {
  const router = useRouter()
  const toasts = useToast()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isStatusLoading, setIsStatusLoading] = useState(false)

  const isAllowedToManage = currentUserRole === "owner" || currentUserRole === "admin"
  const isQueueOpen = queue.isActive

  const handleToggleQueue = async () => {
    setIsStatusLoading(true)
    try {
      const res = await setQueueActiveAction({
        id: queue.id,
        isActive: !isQueueOpen,
        organizationId,
        orgSlug,
      })

      if (res.success) {
        toasts.success(!isQueueOpen ? "Queue opened for new tickets" : "Queue closed to new tickets")
        router.refresh()
      } else {
        toasts.error(res.error || "Failed to update queue status")
      }
    } catch {
      toasts.error("An unexpected error occurred")
    } finally {
      setIsStatusLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href={`/dashboard/organizations/${orgSlug}/queues`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Queues list
        </Link>
      </div>

      {/* Main Queue Header Card */}
      <div
        className="rounded-2xl bg-card border border-border p-8 shadow-sm"
        style={{ boxShadow: "0 10px 30px -10px rgba(44,74,62,0.05)" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4 min-w-0 flex-1">
            {/* Title and status */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-on-surface">{queue.name}</h1>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  isQueueOpen
                    ? "bg-primary/10 text-primary"
                    : "bg-on-surface-variant/10 text-on-surface-variant"
                }`}>
                  {isQueueOpen ? "Open" : "Closed"}
                </span>
              </div>
              {queue.description && (
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {queue.description}
                </p>
              )}
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
              <div className="inline-flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 shrink-0" />
                <span>Passcode:</span>
                <span className="font-semibold text-on-surface">{queue.passcode ? `"${queue.passcode}"` : "Public"}</span>
              </div>
              <span className="text-on-surface-variant/40">•</span>
              <div className="inline-flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span>{isQueueOpen ? "Accepting new tickets" : "Not accepting tickets"}</span>
              </div>
            </div>
          </div>

          {isAllowedToManage && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={handleToggleQueue}
                disabled={isStatusLoading}
                className={`flex items-center gap-2 h-9 px-4 rounded-full font-semibold text-xs transition-all ${
                  isQueueOpen
                    ? "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    : "bg-primary text-on-primary hover:opacity-90"
                }`}
              >
                {isStatusLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isQueueOpen ? (
                  <PowerOff className="h-3.5 w-3.5" />
                ) : (
                  <Power className="h-3.5 w-3.5" />
                )}
                {isQueueOpen ? "Close Queue" : "Open Queue"}
              </Button>
              <Button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-full font-semibold text-xs bg-surface-container text-on-surface hover:bg-surface-container-high transition-all"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Grid of services and counters */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Services List component */}
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
          <ServiceList
            services={queue.services}
            queueId={queue.id}
            currentUserRole={currentUserRole}
            organizationId={organizationId}
            orgSlug={orgSlug}
          />
        </div>

        {/* Counters List component */}
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
          <CounterList
            counters={queue.counters}
            services={queue.services}
            queueId={queue.id}
            currentUserRole={currentUserRole}
            organizationId={organizationId}
            orgSlug={orgSlug}
            organizationMembers={organizationMembers}
          />
        </div>
      </div>

      {/* Dialogs */}
      {isEditOpen && (
        <EditQueueForm
          queue={queue}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {isDeleteOpen && (
        <DeleteQueueDialog
          queueId={queue.id}
          queueName={queue.name}
          organizationId={organizationId}
          orgSlug={orgSlug}
          redirectOnSuccess={true}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}
    </div>
  )
}
