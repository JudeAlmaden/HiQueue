"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { assignStaffAction, unassignStaffAction } from "@/server/actions/assignment.action"
import { useToast } from "@/components/ui/toast"
import { Users, Monitor, ShieldCheck, User, CheckSquare, Square, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserDetail {
  id: string
  name: string | null
  email: string | null
}

interface Membership {
  id: string
  role: string
  user: UserDetail
}

interface Counter {
  id: string
  name: string
  queue: {
    id: string
    name: string
  }
  assignedStaff: {
    id: string
  }[]
}

interface Props {
  members: Membership[]
  counters: Counter[]
  currentUserRole: string
  organizationId: string
  orgSlug: string
}

export function StaffAssignmentManager({ members, counters, currentUserRole, organizationId, orgSlug }: Props) {
  const router = useRouter()
  const toasts = useToast()
  const [selectedStaffId, setSelectedStaffId] = useState<string>(members[0]?.user.id || "")
  const [togglingCounterId, setTogglingCounterId] = useState<string | null>(null)

  const isAllowedToManage = currentUserRole === "owner" || currentUserRole === "admin"
  const selectedStaff = members.find((m) => m.user.id === selectedStaffId)

  const handleToggleAssignment = async (counterId: string, isAssigned: boolean) => {
    if (!isAllowedToManage) return
    setTogglingCounterId(counterId)

    try {
      if (isAssigned) {
        // Unassign
        const res = await unassignStaffAction({
          userId: selectedStaffId,
          counterId,
          orgSlug,
        })
        if (res.success) {
          toasts.success("Staff unassigned successfully!")
          router.refresh()
        } else {
          toasts.error(res.error || "Failed to unassign staff")
        }
      } else {
        // Assign
        const res = await assignStaffAction({
          userId: selectedStaffId,
          counterId,
          organizationId,
          orgSlug,
        })
        if (res.success) {
          toasts.success("Staff assigned successfully!")
          router.refresh()
        } else {
          toasts.error(res.error || "Failed to assign staff")
        }
      }
    } catch (err) {
      toasts.error("An unexpected error occurred. Please try again.")
    } finally {
      setTogglingCounterId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-on-surface">Staff Assignments</h2>
        <p className="text-xs text-on-surface-variant">
          Assign staff members to different service counters across your organization.
        </p>
      </div>

      {members.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Staff Members List */}
          <div className="md:col-span-1 rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
            <div className="p-4 bg-surface-low border-b border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/80 flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Staff Members
              </h3>
            </div>
            
            <div className="divide-y divide-border overflow-y-auto max-h-[400px]">
              {members.map((m) => {
                const isSelected = m.user.id === selectedStaffId
                return (
                  <button
                    key={m.user.id}
                    onClick={() => setSelectedStaffId(m.user.id)}
                    className={`w-full text-left p-4 transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-primary/5 border-l-4 border-primary text-primary"
                        : "hover:bg-surface-low/30 text-on-surface"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">
                        {m.user.name || m.user.email}
                      </p>
                      <p className="text-[10px] text-on-surface-variant/80 truncate mt-0.5">
                        {m.user.name ? m.user.email : m.role}
                      </p>
                    </div>

                    <span className="text-[9px] font-extrabold uppercase bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full shrink-0">
                      {m.role}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Assigned Counters grid */}
          <div className="md:col-span-2 rounded-2xl bg-card border border-border p-6 space-y-4 flex flex-col">
            <div className="border-b border-border/60 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                  <Monitor className="h-4.5 w-4.5 shrink-0" />
                  Counter Access Control
                </h3>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Assigning: <span className="font-semibold text-on-surface">"{selectedStaff?.user.name || selectedStaff?.user.email}"</span>
                </p>
              </div>
            </div>

            {counters.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 overflow-y-auto max-h-[350px]">
                {counters.map((c) => {
                  const isAssigned = c.assignedStaff.some((s) => s.id === selectedStaffId)
                  const isToggling = togglingCounterId === c.id

                  return (
                    <button
                      key={c.id}
                      onClick={() => !isToggling && handleToggleAssignment(c.id, isAssigned)}
                      disabled={!isAllowedToManage || isToggling}
                      className={`flex items-start text-left p-4 rounded-xl border transition-all duration-200 ${
                        isAssigned
                          ? "bg-primary-container/20 border-primary/30 shadow-sm"
                          : "bg-card border-border/80 hover:border-primary/20"
                      } ${!isAllowedToManage ? "cursor-not-allowed opacity-80" : ""}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {/* Checkbox Icon */}
                        <div className="shrink-0 text-primary">
                          {isToggling ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : isAssigned ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5 opacity-60 hover:opacity-100 transition-opacity" />
                          )}
                        </div>

                        {/* Counter Details */}
                        <div className="min-w-0 flex-grow">
                          <p className="text-xs font-bold text-on-surface truncate leading-tight">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1 leading-none">
                            Queue: {c.queue.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 py-12 text-center bg-surface-low/20">
                <Monitor className="h-6 w-6 mx-auto text-on-surface-variant/40 mb-1.5" />
                <p className="text-xs text-on-surface-variant font-medium">No counters configured in this workspace yet</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center bg-card max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-on-surface">No Members Found</p>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              There are no members in this organization to assign yet. Add members in the "Members" tab.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
