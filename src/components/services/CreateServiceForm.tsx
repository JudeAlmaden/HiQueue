"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createServiceAction } from "@/server/actions/service.action"
import { useToast } from "@/components/ui/toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/ui/form-error"
import { X, Loader2 } from "lucide-react"

interface Props {
  queueId: string
  organizationId: string
  orgSlug: string
  onClose: () => void
}

export function CreateServiceForm({ queueId, organizationId, orgSlug, onClose }: Props) {
  const router = useRouter()
  const toasts = useToast()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("queueId", queueId)
    formData.set("organizationId", organizationId)
    formData.set("orgSlug", orgSlug)

    try {
      const res = await createServiceAction(formData)
      if (res.success) {
        toasts.success("Service created successfully!")
        router.refresh()
        onClose()
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
          <h2 className="text-lg font-bold text-on-surface">Add Queue Service</h2>
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
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="E.g., General Inquiries, Technical Support"
              className="rounded-xl h-11 border-0 bg-surface-container text-on-surface focus-visible:ring-2 outline outline-1 outline-outline-variant transition-all"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prefix">Service Prefix</Label>
            <Input
              id="prefix"
              name="prefix"
              type="text"
              placeholder="E.g., A, B, TS, CS (Max 4 alphanumeric characters)"
              className="rounded-xl h-11 border-0 bg-surface-container text-on-surface focus-visible:ring-2 outline outline-1 outline-outline-variant transition-all"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avgDurationMinutes">Average Duration (Minutes)</Label>
            <Input
              id="avgDurationMinutes"
              name="avgDurationMinutes"
              type="number"
              min="1"
              max="480"
              placeholder="E.g., 15 (estimated serving time)"
              className="rounded-xl h-11 border-0 bg-surface-container text-on-surface focus-visible:ring-2 outline outline-1 outline-outline-variant transition-all"
              disabled={isLoading}
            />
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
                  Creating...
                </>
              ) : (
                "Add Service"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
