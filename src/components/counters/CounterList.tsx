"use client"

import { useState } from "react"
import { Monitor, Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateCounterForm } from "./CreateCounterForm"
import { EditCounterForm } from "./EditCounterForm"
import { DeleteCounterDialog } from "./DeleteCounterDialog"
import { CounterDetailDialog } from "./CounterDetailDialog"

interface Service {
  id: string
  name: string
  prefix: string
}

interface Staff {
  id: string
  name: string | null
  email: string | null
  isActive: boolean
}

interface Counter {
  id: string
  name: string
  isActive: boolean
  services?: Service[]
  assignedStaff?: Staff[]
}

interface Props {
  counters: Counter[]
  services: Service[]
  queueId: string
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

export function CounterList({ counters, services, queueId, currentUserRole, organizationId, orgSlug, organizationMembers }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null)
  const [deletingCounter, setDeletingCounter] = useState<Counter | null>(null)
  const [viewingCounter, setViewingCounter] = useState<Counter | null>(null)

  const isAllowedToManage = currentUserRole === "owner" || currentUserRole === "admin"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant/80">Counters</h3>
          <p className="text-[11px] text-on-surface-variant leading-none mt-0.5">
            Configure counter consoles where staff process tickets.
          </p>
        </div>

        {isAllowedToManage && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1 h-8 px-3 rounded-full font-bold text-[11px] bg-primary text-on-primary hover:opacity-90 shadow-sm transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Counter
          </Button>
        )}
      </div>

      {counters.length > 0 ? (
        <div className="space-y-3">
          {counters.map((c) => (
            <div
              key={c.id}
              className="group flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-200 cursor-pointer"
              onClick={() => setViewingCounter(c)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Monitor className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-on-surface">{c.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant">
                    <span>
                      {c.assignedStaff && c.assignedStaff.length > 0 
                        ? `${c.assignedStaff.length} staff`
                        : "No staff"}
                    </span>
                    <span className="text-on-surface-variant/40">•</span>
                    <span>
                      {c.services && c.services.length > 0 
                        ? `${c.services.length} service${c.services.length > 1 ? 's' : ''}`
                        : "All services"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {isAllowedToManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingCounter(c)
                    }}
                    className="h-8 w-8 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container"
                    title="Edit counter"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-10 text-center bg-surface-low/20">
          <span className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-primary/5 text-primary/40 mb-3">
            <Monitor className="h-5 w-5" />
          </span>
          <p className="text-xs text-on-surface font-bold">No Counters Configured</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">Add a counter to start directing queue flow.</p>
        </div>
      )}

      {/* Modals */}
      {isAddOpen && (
        <CreateCounterForm
          queueId={queueId}
          services={services}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {editingCounter && (
        <EditCounterForm
          counter={editingCounter}
          services={services}
          queueId={queueId}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setEditingCounter(null)}
        />
      )}

      {deletingCounter && (
        <DeleteCounterDialog
          counterId={deletingCounter.id}
          counterName={deletingCounter.name}
          queueId={queueId}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setDeletingCounter(null)}
        />
      )}

      {viewingCounter && (
        <CounterDetailDialog
          counter={viewingCounter}
          organizationMembers={organizationMembers}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setViewingCounter(null)}
          onEdit={isAllowedToManage ? () => {
            setViewingCounter(null)
            setEditingCounter(viewingCounter)
          } : undefined}
          onDelete={isAllowedToManage ? () => {
            setViewingCounter(null)
            setDeletingCounter(viewingCounter)
          } : undefined}
        />
      )}
    </div>
  )
}
