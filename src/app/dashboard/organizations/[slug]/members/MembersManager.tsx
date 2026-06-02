"use client"

import type { ElementType } from "react"
import { useState } from "react"
import { Crown, ShieldCheck, User, Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateMemberForm } from "@/components/members/CreateMemberForm"
import { EditMemberForm } from "@/components/members/EditMemberForm"
import { DeleteMemberDialog } from "@/components/members/DeleteMemberDialog"

const ROLE_META: Record<string, {
  label: string
  purpose: string
  summary: string
  icon: ElementType
  className: string
}> = {
  owner: {
    label: "Owner",
    purpose: "Owns workspace setup, member authority, and organization-level decisions.",
    summary: "Full control",
    icon: Crown,
    className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800/30",
  },
  admin: {
    label: "Admin",
    purpose: "Runs operations by managing queues, services, counters, assignments, and staff.",
    summary: "Operations manager",
    icon: ShieldCheck,
    className: "bg-primary/10 text-primary border border-primary/20",
  },
  staff: {
    label: "Staff",
    purpose: "Works assigned counters and handles customer tickets during queue sessions.",
    summary: "Counter operator",
    icon: User,
    className: "bg-outline/10 text-outline border border-outline/20",
  },
}

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

interface Props {
  memberships: Membership[]
  currentUserId: string
  currentUserRole: string
  organizationId: string
  orgSlug: string
}

export function MembersManager({ memberships, currentUserId, currentUserRole, organizationId, orgSlug, layout = "grid" }: Props & { layout?: "grid" | "sidebar" }) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any | null>(null)
  const [deletingMember, setDeletingMember] = useState<any | null>(null)

  const isAllowedToManage = currentUserRole === "owner" || currentUserRole === "admin"
  const roleCounts = memberships.reduce<Record<string, number>>((counts, member) => {
    counts[member.role] = (counts[member.role] ?? 0) + 1
    return counts
  }, {})

  // Member limits
  const MEMBER_LIMITS = {
    staff: 25,
    admin: 5,
    total: 30,
  }

  const totalCount = memberships.length
  const staffCount = roleCounts.staff || 0
  const adminCount = roleCounts.admin || 0
  const canAddMember = totalCount < MEMBER_LIMITS.total

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-on-surface">Workspace Members</h2>
          <p className="text-xs text-on-surface-variant">
            Manage who has access to this workspace and their permission levels.
          </p>
          {isAllowedToManage && (
            <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1.5">
              <span className={`font-semibold ${totalCount >= MEMBER_LIMITS.total ? "text-error" : "text-primary"}`}>
                {totalCount} / {MEMBER_LIMITS.total}
              </span>
              <span>total members</span>
              <span className="text-on-surface-variant/40">•</span>
              <span className={`font-semibold ${staffCount >= MEMBER_LIMITS.staff ? "text-error" : "text-on-surface"}`}>
                {staffCount} / {MEMBER_LIMITS.staff}
              </span>
              <span>staff</span>
              <span className="text-on-surface-variant/40">•</span>
              <span className={`font-semibold ${adminCount >= MEMBER_LIMITS.admin ? "text-error" : "text-on-surface"}`}>
                {adminCount} / {MEMBER_LIMITS.admin}
              </span>
              <span>admins</span>
            </p>
          )}
        </div>

        {isAllowedToManage && (
          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={() => setIsAddOpen(true)}
              disabled={!canAddMember}
              className="flex items-center gap-1.5 h-10 px-5 rounded-full font-bold text-xs bg-primary text-on-primary hover:opacity-90 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
            {!canAddMember && (
              <span className="text-[10px] text-error font-medium">
                Member limit reached
              </span>
            )}
          </div>
        )}
      </div>

      <div className={layout === "sidebar" ? "flex flex-col gap-3" : "grid gap-3 md:grid-cols-3"}>
        {(["owner", "admin", "staff"] as const).map((role) => {
          const meta = ROLE_META[role]
          const RoleIcon = meta.icon

          return (
            <div key={role} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${meta.className}`}>
                  <RoleIcon className="h-5 w-5 shrink-0" />
                </span>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold text-on-surface">{meta.label}</p>
                    <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      {roleCounts[role] ?? 0}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">{meta.summary}</p>
                  <p className="text-xs leading-relaxed text-on-surface-variant">{meta.purpose}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Members Grid/List */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
        {memberships.map((m) => {
          const meta = ROLE_META[m.role] ?? ROLE_META.staff
          const RoleIcon = meta.icon
          const isYou = m.user.id === currentUserId
          const canDelete =
            isAllowedToManage &&
            !isYou &&
            m.role !== "owner"

          const canEdit =
            isAllowedToManage &&
            !isYou &&
            m.role !== "owner"

          return (
            <div key={m.id} className="flex items-center justify-between p-4 gap-4 hover:bg-surface-low/30 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold uppercase">
                  {(m.user.name ?? m.user.email ?? "?").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface flex items-center gap-1.5 truncate">
                    {m.user.name ?? m.user.email}
                    {isYou && <span className="text-[10px] bg-primary/5 px-2 py-0.5 rounded-full text-primary font-bold">(you)</span>}
                  </p>
                  {m.user.name && (
                    <p className="text-xs text-on-surface-variant truncate">{m.user.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${meta.className}`}>
                  <RoleIcon className="h-3 w-3 shrink-0" />
                  {meta.label}
                </span>
                <span className="hidden max-w-[16rem] text-xs text-on-surface-variant lg:block">
                  {meta.summary}
                </span>

                {/* Management Controls */}
                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingMember({ ...m.user, role: m.role })}
                        className="h-8 w-8 text-on-surface-variant hover:text-primary rounded-full"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingMember(m.user)}
                        className="h-8 w-8 text-on-surface-variant hover:text-error rounded-full hover:bg-error/5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {isAddOpen && (
        <CreateMemberForm
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {editingMember && (
        <EditMemberForm
          member={editingMember}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setEditingMember(null)}
        />
      )}

      {deletingMember && (
        <DeleteMemberDialog
          memberId={deletingMember.id}
          memberName={deletingMember.name || deletingMember.email || "Member"}
          organizationId={organizationId}
          orgSlug={orgSlug}
          onClose={() => setDeletingMember(null)}
        />
      )}
    </div>
  )
}
