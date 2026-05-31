"use client"

import { useState } from "react"
import { Tag, Plus, Edit2, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateServiceForm } from "./CreateServiceForm"
import { EditServiceForm } from "./EditServiceForm"
import { DeleteServiceDialog } from "./DeleteServiceDialog"

interface Service {
  id: string
  name: string
  prefix: string
  avgDurationMinutes: number | null
}

interface Props {
  services: Service[]
  queueId: string
  currentUserRole: string
  organizationId: string
  orgSlug: string
}

export function ServiceList({ services, queueId, currentUserRole, organizationId, orgSlug }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingService, setDeletingService] = useState<Service | null>(null)

  const isAllowedToManage = currentUserRole === "owner" || currentUserRole === "admin"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant/80">Services</h3>
          <p className="text-[11px] text-on-surface-variant leading-none mt-0.5">
            Configure different service types and prefixes.
          </p>
        </div>

        {isAllowedToManage && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1 h-8 px-3 rounded-full font-bold text-[11px] bg-primary text-on-primary hover:opacity-90 shadow-sm transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Service
          </Button>
        )}
      </div>

      {services.length > 0 ? (
        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/80 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">
                  {s.prefix}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{s.name}</p>
                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-3 w-3 shrink-0" />
                    Est. Duration: {s.avgDurationMinutes ? `${s.avgDurationMinutes} mins` : "Not specified"}
                  </p>
                </div>
              </div>

              {isAllowedToManage && (
                <div className="flex items-center gap-1 shrink-0">
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
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/80 py-10 text-center bg-surface-low/20">
          <Tag className="h-6 w-6 mx-auto text-on-surface-variant/40 mb-1.5" />
          <p className="text-xs text-on-surface-variant font-medium">No services configured yet</p>
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
