"use client"

import { useState } from "react"
import { Users, Monitor, X } from "lucide-react"
import { MembersManager } from "@/app/dashboard/organizations/[slug]/members/MembersManager"
import { StaffAssignmentManager } from "@/components/assignments/StaffAssignmentManager"

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
  currentUserId: string
  currentUserRole: string
  organizationId: string
  orgSlug: string
}

export function ManagerControls({
  members,
  counters,
  currentUserId,
  currentUserRole,
  organizationId,
  orgSlug,
}: Props) {
  const [activeModal, setActiveModal] = useState<"members" | "assignments" | null>(null)

  const handleClose = () => {
    setActiveModal(null)
  }

  const isOwner = currentUserRole === "owner"

  return (
    <>
      {/* Trigger Cards */}
      <div className={`grid gap-2 ${isOwner ? "sm:grid-cols-2" : "grid-cols-1"} md:min-w-[24rem]`}>
        {isOwner && (
          <button
            onClick={() => setActiveModal("members")}
            className="text-left rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-on-surface-variant/70" />
              People
            </p>
            <p className="mt-1 text-sm font-bold text-on-surface">Manage roles</p>
          </button>
        )}

        <button
          onClick={() => setActiveModal("assignments")}
          className={`text-left rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/20 ${!isOwner ? "w-full md:min-w-[12rem]" : ""}`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5 text-on-surface-variant/70" />
            Counters
          </p>
          <p className="mt-1 text-sm font-bold text-on-surface">Assign staff</p>
        </button>
      </div>

      {/* Modern High-Fidelity Dialog/Modal Container */}
      {activeModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-md animate-fade-in">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={handleClose} />

          <div
            className={`relative w-full ${
              activeModal === "members" ? "max-w-4xl" : "max-w-5xl"
            } bg-card border border-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up z-10`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-low/50">
              <div className="flex items-center gap-2">
                {activeModal === "members" ? (
                  <>
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-on-surface">Manage Workspace Roles</h3>
                  </>
                ) : (
                  <>
                    <Monitor className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-on-surface">Assign Staff to Counters</h3>
                  </>
                )}
              </div>
              <button
                onClick={handleClose}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-low"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeModal === "members" ? (
                <MembersManager
                  memberships={members}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  organizationId={organizationId}
                  orgSlug={orgSlug}
                />
              ) : (
                <StaffAssignmentManager
                  members={members}
                  counters={counters}
                  currentUserRole={currentUserRole}
                  organizationId={organizationId}
                  orgSlug={orgSlug}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
