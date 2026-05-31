"use client"

import { useState } from "react"
import { Users, Crown, ShieldCheck, User, Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateMemberForm } from "@/components/members/CreateMemberForm"
import { EditMemberForm } from "@/components/members/EditMemberForm"
import { DeleteMemberDialog } from "@/components/members/DeleteMemberDialog"

const ROLE_META: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  owner: { label: "Owner", icon: Crown, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  admin: { label: "Admin", icon: ShieldCheck, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  staff: { label: "Staff", icon: User, className: "bg-secondary/10 text-secondary" },
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

export function MembersManager({ memberships, currentUserId, currentUserRole, organizationId, orgSlug }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any | null>(null)
  const [deletingMember, setDeletingMember] = useState<any | null>(null)

  const isAllowedToManage = currentUserRole === "owner" || currentUserRole === "admin"

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-on-surface">Workspace Members</h2>
          <p className="text-xs text-on-surface-variant">
            Manage who has access to this workspace and their permission levels.
          </p>
        </div>

        {isAllowedToManage && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 h-10 px-5 rounded-full font-bold text-xs bg-primary text-on-primary hover:opacity-90 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        )}
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
            // Admins cannot remove owners
            !(currentUserRole === "admin" && m.role === "owner") &&
            // Cannot remove the last owner (if they are owner, owner can be removed by other owners, but usually owner is protected)
            m.role !== "owner"

          const canEdit =
            isAllowedToManage &&
            !isYou &&
            !(currentUserRole === "admin" && m.role === "owner")

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
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${meta.className}`}>
                  <RoleIcon className="h-3 w-3" />
                  {meta.label}
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
