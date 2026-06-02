"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteMemberAction } from "@/server/actions/member.action"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/ui/form-error"
import { AlertTriangle, Loader2 } from "lucide-react"

interface Props {
  memberId: string
  memberName: string
  organizationId: string
  orgSlug: string
  onClose: () => void
}

export function DeleteMemberDialog({ memberId, memberName, organizationId, orgSlug, onClose }: Props) {
  const router = useRouter()
  const toasts = useToast()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await deleteMemberAction({
        id: memberId,
        organizationId,
        orgSlug,
      })

      if (res.success) {
        toasts.success("Member removed successfully!")
        router.refresh()
        onClose()
      } else {
        setError(res.error)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
        {/* Warning Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error-container text-on-error-container shadow-sm">
            <AlertTriangle className="h-6 w-6 text-error" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">Remove Member?</h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Are you sure you want to remove <span className="font-semibold text-on-surface">"{memberName}"</span> from this organization?
            </p>
          </div>
        </div>

        {error && <FormError message={error} />}

        <div className="rounded-xl bg-surface-low p-3.5 border border-border/40 text-[11px] text-on-surface-variant leading-relaxed">
          <span className="font-semibold text-on-surface">Warning:</span> The member will be removed from this workspace and their account will be deactivated (soft delete). If they are assigned to any counters, you must unassign them first before removal.
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-10 rounded-full text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-10 rounded-full text-xs font-bold bg-error text-on-error hover:opacity-95 shadow-sm transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Removing...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
