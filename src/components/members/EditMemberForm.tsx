"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateMemberAction } from "@/server/actions/member.action"
import { useToast } from "@/components/ui/toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/ui/form-error"
import { X, Loader2 } from "lucide-react"

const ROLE_OPTIONS = [
  {
    value: "admin",
    label: "Admin",
    purpose: "Operations manager — configures queues, counters, services, assignments, and staff.",
  },
  {
    value: "staff",
    label: "Staff",
    purpose: "Counter operator — serves customers only from assigned counters.",
  },
]

interface Member {
  id: string
  name: string | null
  email: string | null
  role: string
}

interface Props {
  member: Member
  organizationId: string
  orgSlug: string
  onClose: () => void
}

export function EditMemberForm({ member, organizationId, orgSlug, onClose }: Props) {
  const router = useRouter()
  const toasts = useToast()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("id", member.id)
    formData.set("organizationId", organizationId)
    formData.set("orgSlug", orgSlug)

    try {
      const res = await updateMemberAction(formData)
      if (res.success) {
        toasts.success("Member updated successfully!")
        onClose()
        router.refresh()
      } else {
        setError(res.error)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-on-surface">Edit Member</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-low"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && <FormError message={error} />}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={member.name || ""}
              placeholder="Alice Johnson"
              className="rounded-xl h-11 border-0 bg-surface-container text-on-surface focus-visible:ring-2 outline outline-1 outline-outline-variant transition-all"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={member.email || ""}
              placeholder="alice@company.com"
              className="rounded-xl h-11 border-0 bg-surface-container text-on-surface focus-visible:ring-2 outline outline-1 outline-outline-variant transition-all"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Workspace Role</Label>
            <select
              id="role"
              name="role"
              className="w-full px-3 h-11 rounded-xl bg-surface-container text-on-surface border-0 outline outline-1 outline-outline-variant text-sm focus-visible:ring-2 transition-all"
              required
              disabled={isLoading}
              defaultValue={member.role}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <div className="space-y-1 rounded-xl bg-surface-container/60 p-3">
              {ROLE_OPTIONS.map((role) => (
                <p key={role.value} className="text-[11px] leading-relaxed text-on-surface-variant">
                  <span className="font-bold text-on-surface">{role.label}:</span> {role.purpose}
                </p>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="h-10 px-4 rounded-full text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 px-5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-95 shadow-sm transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
