"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2, Pencil, Trash2, Users, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateOrganizationAction, deleteOrganizationAction } from "@/server/actions/organization.action"

interface Org {
  id: string
  name: string
  slug: string
  createdAt: Date
  memberships: { role: string; user?: { id: string } }[]
}

export function OrgCard({ org, currentUserId }: { org: Org; currentUserId?: string }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const memberCount = org.memberships.length
  const role =
    org.memberships.find((m) => m.user?.id === currentUserId)?.role ??
    org.memberships[0]?.role ??
    "member"

  return (
    <>
      {/* Card */}
      <div className="group relative flex flex-col rounded-xl bg-card ring-1 ring-border hover:ring-2 hover:ring-primary/50 transition-all overflow-hidden">
        {/* Clickable area */}
        <Link
          href={`/dashboard/organizations/${org.slug}`}
          className="flex flex-col gap-4 p-5 flex-1"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors">
                  {org.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate">{org.slug}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary/50 text-secondary-foreground capitalize">
              {role}
            </span>
          </div>
        </Link>

        {/* Actions (only for owners) */}
        {role === "owner" && (
          <div className="flex items-center gap-2 px-5 pb-4 pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.preventDefault()
                setEditError(null)
                setEditOpen(true)
              }}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Rename
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.preventDefault()
                setDeleteError(null)
                setDeleteOpen(true)
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-card ring-1 ring-border p-6 space-y-5 shadow-xl">
            <div>
              <h2 className="text-base font-semibold text-foreground">Rename organization</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Update the display name for this workspace.</p>
            </div>

            {editError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{editError}</p>
            )}

            <form
              action={async (formData) => {
                setIsEditLoading(true)
                setEditError(null)
                const res = await updateOrganizationAction(formData)
                if (res && !res.success) {
                  setEditError(res.error)
                  setIsEditLoading(false)
                } else {
                  setEditOpen(false)
                  setIsEditLoading(false)
                }
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={org.id} />
              <div className="space-y-1.5">
                <Label htmlFor={`edit-name-${org.id}`}>Organization name</Label>
                <Input
                  id={`edit-name-${org.id}`}
                  name="name"
                  defaultValue={org.name}
                  required
                  minLength={2}
                  maxLength={50}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditOpen(false)}
                  disabled={isEditLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isEditLoading}>
                  {isEditLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-card ring-1 ring-border p-6 space-y-5 shadow-xl">
            <div>
              <h2 className="text-base font-semibold text-foreground">Delete organization</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                This will permanently delete <span className="font-medium text-foreground">{org.name}</span> and all its data. This cannot be undone.
              </p>
            </div>

            {deleteError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{deleteError}</p>
            )}

            <form
              action={async (formData) => {
                setIsDeleteLoading(true)
                setDeleteError(null)
                const res = await deleteOrganizationAction(formData)
                if (res && !res.success) {
                  setDeleteError(res.error)
                  setIsDeleteLoading(false)
                } else {
                  setDeleteOpen(false)
                  setIsDeleteLoading(false)
                }
              }}
            >
              <input type="hidden" name="id" value={org.id} />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteOpen(false)}
                  disabled={isDeleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                  disabled={isDeleteLoading}
                >
                  {isDeleteLoading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
