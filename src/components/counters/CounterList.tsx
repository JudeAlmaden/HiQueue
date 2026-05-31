"use client"

import { useState } from "react"
import { Monitor, Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateCounterForm } from "./CreateCounterForm"
import { EditCounterForm } from "./EditCounterForm"
import { DeleteCounterDialog } from "./DeleteCounterDialog"

interface Service {
  id: string
  name: string
  prefix: string
}

interface Counter {
  id: string
  name: string
  isActive: boolean
  services?: Service[]
}

interface Props {
  counters: Counter[]
  services: Service[]
  queueId: string
  currentUserRole: string
  organizationId: string
  orgSlug: string
}

export function CounterList({ counters, services, queueId, currentUserRole, organizationId, orgSlug }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null)
  const [deletingCounter, setDeletingCounter] = useState<Counter | null>(null)

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
              className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/80 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  <Monitor className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{c.name}</p>
                  
                  {/* Service badges */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {c.services && c.services.length > 0 ? (
                      c.services.map((srv) => (
                        <span
                          key={srv.id}
                          className="inline-flex items-center text-[9px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full"
                        >
                          {srv.name}
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex items-center text-[9px] font-semibold bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">
                        All Services
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isAllowedToManage && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingCounter(c)}
                    className="h-8 w-8 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-low"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingCounter(c)}
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
          <Monitor className="h-6 w-6 mx-auto text-on-surface-variant/40 mb-1.5" />
          <p className="text-xs text-on-surface-variant font-medium">No counters configured yet</p>
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
    </div>
  )
}
