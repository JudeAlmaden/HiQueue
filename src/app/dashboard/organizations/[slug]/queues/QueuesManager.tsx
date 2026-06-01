"use client"

import { useState } from "react"
import Link from "next/link"
import { ListOrdered, Plus, Edit2, Trash2, Key, Users, Settings, ExternalLink, Monitor, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateQueueForm } from "@/components/queues/CreateQueueForm"
import { EditQueueForm } from "@/components/queues/EditQueueForm"
import { DeleteQueueDialog } from "@/components/queues/DeleteQueueDialog"

interface Queue {
  id: string
  name: string
  description: string | null
  passcode: string | null
  isActive: boolean
  createdAt: Date | string
  _count?: {
    services: number
    counters: number
  }
}

interface Props {
  queues: Queue[]
  currentUserRole: string
  organizationId: string
  orgSlug: string
}

export function QueuesManager({ queues, currentUserRole, organizationId, orgSlug }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null)
  const [deletingQueue, setDeletingQueue] = useState<Queue | null>(null)

  const isAllowedToManage = currentUserRole === "owner" || currentUserRole === "admin"

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Queues</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Create, manage, and configure wait queues for different services.
          </p>
        </div>

        {isAllowedToManage && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 h-10 px-5 rounded-full font-semibold text-sm bg-primary text-on-primary hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Queue
          </Button>
        )}
      </div>

      {/* Queues grid */}
      {queues.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {queues.map((q) => (
            <div
              key={q.id}
              className="group rounded-2xl bg-card border border-border p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 flex flex-col gap-6"
            >
              {/* Header Section */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-on-surface mb-1.5">
                      {q.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {q.description || "No description provided."}
                    </p>
                  </div>

                  {/* Actions */}
                  {isAllowedToManage && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingQueue(q)}
                        className="h-8 w-8 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingQueue(q)}
                        className="h-8 w-8 text-on-surface-variant hover:text-error rounded-full hover:bg-error/5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  {q.passcode ? (
                    <>
                      <Key className="h-3.5 w-3.5 shrink-0" />
                      <span>Passcode Protected</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>Public Entry</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-border/60">
                <Link
                  href={`/org/${orgSlug}/display/${q.id}`}
                  target="_blank"
                  className="w-full h-10 rounded-full font-semibold text-sm bg-primary text-on-primary hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Live View Screen
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/live/${q.id}`}
                    target="_blank"
                    className="h-9 rounded-full text-xs font-semibold bg-surface-container text-on-surface hover:bg-surface-container-high transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Live Kiosk
                  </Link>
                  <Link
                    href={`/dashboard/organizations/${orgSlug}/queues/${q.id}`}
                    className="h-9 rounded-full text-xs font-semibold bg-surface-container text-on-surface hover:bg-surface-container-high transition-all flex items-center justify-center gap-1.5"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center bg-surface-low/20 max-w-xl mx-auto space-y-4">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/5 text-primary/40">
            <ListOrdered className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-on-surface">No Queues Found</p>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              There are no queues configured in this workspace yet. Get started by creating your first queue.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddOpen && (
        <CreateQueueForm
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {editingQueue && (
        <EditQueueForm
          queue={editingQueue}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setEditingQueue(null)}
        />
      )}

      {deletingQueue && (
        <DeleteQueueDialog
          queueId={deletingQueue.id}
          queueName={deletingQueue.name}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setDeletingQueue(null)}
        />
      )}
    </div>
  )
}
