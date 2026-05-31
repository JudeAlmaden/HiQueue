"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Key, Info, ListOrdered } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditQueueForm } from "@/components/queues/EditQueueForm"
import { DeleteQueueDialog } from "@/components/queues/DeleteQueueDialog"
import { ServiceList } from "@/components/services/ServiceList"
import { CounterList } from "@/components/counters/CounterList"

interface Props {
  queue: any
  currentUserRole: string
  organizationId: string
  orgSlug: string
}

export function QueueDetailClient({ queue, currentUserRole, organizationId, orgSlug }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const isAllowedToManage = currentUserRole === "owner" || currentUserRole === "admin"

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={`/dashboard/organizations/${orgSlug}/queues`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Queues list
        </Link>
      </div>

      {/* Main Queue Stats/Details Card */}
      <div
        className="rounded-2xl bg-card border border-border p-6 shadow-md space-y-4"
        style={{ boxShadow: "0 10px 30px -10px rgba(44,74,62,0.05)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ListOrdered className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-on-surface truncate">{queue.name}</h2>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {queue.description || "No description provided."}
            </p>
          </div>

          {isAllowedToManage && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-1 h-9 px-3.5 rounded-full font-bold text-xs bg-secondary-container text-on-secondary-container hover:opacity-90 shadow-sm transition-all"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-1 h-9 px-3.5 rounded-full font-bold text-xs bg-error text-on-error hover:opacity-90 shadow-sm transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Quick Info bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Key className="h-4 w-4 shrink-0 opacity-80" />
            <span className="font-semibold">Passcode:</span>
            <span>{queue.passcode ? `"${queue.passcode}"` : "None (Public Entry)"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Info className="h-4 w-4 shrink-0 opacity-80" />
            <span className="font-semibold">Est. Serving Duration:</span>
            <span>Est. wait shown dynamically</span>
          </div>
        </div>
      </div>

      {/* Grid of services and counters */}
      <div className="grid gap-8 lg:grid-cols-2">
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
