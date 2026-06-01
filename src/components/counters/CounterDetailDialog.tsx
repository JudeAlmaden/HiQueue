"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Monitor, Users, Tag, X, Edit2, Trash2, Plus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { assignStaffAction, unassignStaffAction } from "@/server/actions/assignment.action"

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

interface OrgMember {
  id: string
  name: string | null
  email: string | null
  role: string
}

interface Props {
  counter: Counter
  organizationMembers: OrgMember[]
  organizationId: string
  orgSlug: string
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function CounterDetailDialog({ counter, organizationMembers, organizationId, orgSlug, onClose, onEdit, onDelete }: Props) {
  const router = useRouter()
  const toasts = useToast()
  const [isAssigning, setIsAssigning] = useState(false)
  const [removingStaffId, setRemovingStaffId] = useState<string | null>(null)

  // Get unassigned members
  const assignedStaffIds = new Set(counter.assignedStaff?.map(s => s.id) || [])
  const unassignedMembers = organizationMembers.filter(m => !assignedStaffIds.has(m.id))

  const handleAssignStaff = async (userId: string) => {
    setIsAssigning(true)
    try {
      const res = await assignStaffAction({
        userId,
        counterId: counter.id,
        organizationId,
        orgSlug,
      })

      if (res.success) {
        toasts.success("Staff member assigned successfully")
        router.refresh()
      } else {
        toasts.error(res.error || "Failed to assign staff member")
      }
    } catch {
      toasts.error("An unexpected error occurred")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassignStaff = async (userId: string) => {
    setRemovingStaffId(userId)
    try {
      const res = await unassignStaffAction({
        userId,
        counterId: counter.id,
        orgSlug,
      })

      if (res.success) {
        toasts.success("Staff member removed successfully")
        router.refresh()
      } else {
        toasts.error(res.error || "Failed to remove staff member")
      }
    } catch {
      toasts.error("An unexpected error occurred")
    } finally {
      setRemovingStaffId(null)
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[12px]"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
        style={{ boxShadow: "0 20px 60px -10px rgba(44,74,62,0.15)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border/60">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Monitor className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-on-surface truncate">{counter.name}</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Counter Details</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 shrink-0 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-low"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Services Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary/70" />
              <h3 className="text-sm font-bold text-on-surface">Services</h3>
            </div>
            
            {counter.services && counter.services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {counter.services.map((srv) => (
                  <div
                    key={srv.id}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary-container/50 border border-secondary-container"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-secondary-container text-on-secondary-container font-bold text-[10px] uppercase">
                      {srv.prefix}
                    </span>
                    <span className="text-sm font-medium text-on-secondary-container">
                      {srv.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-center bg-surface-low/20">
                <p className="text-xs text-on-surface-variant">
                  This counter handles <span className="font-bold text-on-surface">all services</span>
                </p>
              </div>
            )}
          </div>

          {/* Staff Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary/70" />
                <h3 className="text-sm font-bold text-on-surface">Assigned Staff</h3>
              </div>
              {unassignedMembers.length > 0 && (
                <span className="text-xs text-on-surface-variant">
                  {unassignedMembers.length} available
                </span>
              )}
            </div>
            
            {/* Currently Assigned Staff */}
            {counter.assignedStaff && counter.assignedStaff.length > 0 ? (
              <div className="space-y-2">
                {counter.assignedStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-surface-container border border-border/60"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                      {(staff.name || staff.email || "S").charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {staff.name || staff.email?.split("@")[0] || "Staff Member"}
                      </p>
                      {staff.email && (
                        <p className="text-xs text-on-surface-variant truncate">{staff.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`h-2 w-2 rounded-full ${
                        staff.isActive ? "bg-primary" : "bg-on-surface-variant/30"
                      }`} title={staff.isActive ? "Active" : "Inactive"} />
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnassignStaff(staff.id)}
                          disabled={removingStaffId === staff.id}
                          className="h-7 w-7 text-on-surface-variant hover:text-error rounded-full hover:bg-error/5"
                          title="Remove from counter"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-center bg-surface-low/20">
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-on-surface-variant/5 text-on-surface-variant/40 mb-2">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-on-surface">No Staff Assigned</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Assign staff members to this counter to start processing tickets.
                </p>
              </div>
            )}

            {/* Available Staff to Assign */}
            {onEdit && unassignedMembers.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-on-surface-variant mb-2">Available Staff</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {unassignedMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleAssignStaff(member.id)}
                      disabled={isAssigning}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-container border border-transparent hover:border-border/60 transition-all text-left disabled:opacity-50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-on-surface-variant/10 text-on-surface-variant font-bold text-xs uppercase">
                        {(member.name || member.email || "M").charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-on-surface truncate">
                          {member.name || member.email?.split("@")[0] || "Member"}
                        </p>
                        {member.email && (
                          <p className="text-[10px] text-on-surface-variant truncate">{member.email}</p>
                        )}
                      </div>
                      <Plus className="h-4 w-4 text-primary shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {(onEdit || onDelete) && (
          <div className="flex items-center justify-between gap-2 p-4 border-t border-border/60 bg-surface-container-low">
            <div>
              {onDelete && (
                <Button
                  onClick={onDelete}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-full font-semibold text-xs text-error hover:bg-error/10 transition-all"
                  variant="ghost"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Counter
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onClose}
                className="h-9 px-4 rounded-full font-semibold text-xs bg-surface-container text-on-surface hover:bg-surface-container-high transition-all"
              >
                Close
              </Button>
              {onEdit && (
                <Button
                  onClick={onEdit}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-full font-semibold text-xs bg-primary text-on-primary hover:opacity-90 transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Counter
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
