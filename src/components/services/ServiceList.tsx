"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tag, Plus, Edit2, Trash2, Calendar, Loader2, Power, PowerOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { setServiceActiveAction } from "@/server/actions/service.action"
import { CreateServiceForm } from "./CreateServiceForm"
import { EditServiceForm } from "./EditServiceForm"
import { DeleteServiceDialog } from "./DeleteServiceDialog"

interface Service {
  id: string
  name: string
  prefix: string
  avgDurationMinutes: number | null
  isActive: boolean
}

interface Props {
  services: Service[]
  queueId: string
  currentUserRole: string
  organizationId: string
  orgSlug: string
}

export function ServiceList({ services, queueId, currentUserRole, organizationId, orgSlug }: Props) {
  const router = useRouter()
  const toasts = useToast()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingService, setDeletingService] = useState<Service | null>(null)
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null)

  const isOwner = currentUserRole === "owner"
  const canCloseServices = isOwner || currentUserRole === "admin"
  const openCount = services.filter((service) => service.isActive).length
  const SERVICE_LIMIT = 50
  const serviceCount = services.length
  const canCreateService = serviceCount < SERVICE_LIMIT

  const handleToggleService = async (service: Service) => {
    if (!isOwner && !service.isActive) {
      toasts.error("Only organization owners can reopen services.")
      return
    }

    setStatusLoadingId(service.id)
    try {
      const res = await setServiceActiveAction({
        id: service.id,
        isActive: !service.isActive,
        organizationId,
        orgSlug,
        queueId,
      })

      if (res.success) {
        toasts.success(!service.isActive ? "Service opened for new tickets" : "Service closed to new tickets")
        router.refresh()
      } else {
        toasts.error(res.error || "Failed to update service status")
      }
    } catch {
      toasts.error("An unexpected error occurred")
    } finally {
      setStatusLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant/80">Services</h3>
          <p className="text-[11px] text-on-surface-variant leading-none mt-0.5">
            {openCount} of {services.length} open for new tickets.
          </p>
        </div>

        {isOwner && (
          <div className="flex flex-col items-end gap-1">
            <Button
              onClick={() => setIsAddOpen(true)}
              disabled={!canCreateService}
              className="flex items-center gap-1 h-8 px-3 rounded-full font-bold text-[11px] bg-primary text-on-primary hover:opacity-90 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Service
            </Button>
            {!canCreateService && (
              <span className="text-[9px] text-error font-medium">
                Limit reached
              </span>
            )}
          </div>
        )}
      </div>

      {services.length > 0 ? (
        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.id}
              className={`flex items-center justify-between p-3.5 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all duration-200 ${
                s.isActive
                  ? "border-border/80 hover:border-primary/20"
                  : "border-error/20 bg-error/5"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs uppercase ${
                  s.isActive ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
                }`}>
                  {s.prefix}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-on-surface truncate">{s.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                      s.isActive ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
                    }`}>
                      {s.isActive ? "Open" : "Closed"}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-3 w-3 shrink-0" />
                    Est. Duration: {s.avgDurationMinutes ? `${s.avgDurationMinutes} mins` : "Not specified"}
                  </p>
                </div>
              </div>

              {(isOwner || (canCloseServices && s.isActive)) && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleService(s)}
                    disabled={statusLoadingId === s.id}
                    className={`h-8 w-8 rounded-full ${
                      s.isActive
                        ? "text-error hover:bg-error/5 hover:text-error"
                        : "text-primary hover:bg-primary/5 hover:text-primary"
                    }`}
                    title={s.isActive ? "Close service" : "Open service"}
                  >
                    {statusLoadingId === s.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : s.isActive ? (
                      <PowerOff className="h-3.5 w-3.5" />
                    ) : (
                      <Power className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  {isOwner && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingService(s)}
                        className="h-8 w-8 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-low"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingService(s)}
                        className="h-8 w-8 text-on-surface-variant hover:text-error rounded-full hover:bg-error/5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-10 text-center bg-surface-low/20">
          <span className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-primary/5 text-primary/40 mb-3">
            <Tag className="h-5 w-5" />
          </span>
          <p className="text-xs text-on-surface font-bold">No Services Configured</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">Create your first service to begin issuing tickets.</p>
        </div>
      )}

      {/* Modals */}
      {isAddOpen && (
        <CreateServiceForm
          queueId={queueId}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {editingService && (
        <EditServiceForm
          service={editingService}
          queueId={queueId}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setEditingService(null)}
        />
      )}

      {deletingService && (
        <DeleteServiceDialog
          serviceId={deletingService.id}
          serviceName={deletingService.name}
          queueId={queueId}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setDeletingService(null)}
        />
      )}
    </div>
  )
}
