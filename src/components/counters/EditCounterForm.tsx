"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateCounterAction } from "@/server/actions/counter.action"
import { useToast } from "@/components/ui/toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/ui/form-error"
import { X, Loader2 } from "lucide-react"

interface Service {
  id: string
  name: string
  prefix: string
}

interface Counter {
  id: string
  name: string
  services?: { id: string }[]
}

interface Props {
  counter: Counter
  services: Service[]
  queueId: string
  organizationId: string
  orgSlug: string
  onClose: () => void
}

export function EditCounterForm({ counter, services, queueId, organizationId, orgSlug, onClose }: Props) {
  const router = useRouter()
  const toasts = useToast()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("id", counter.id)
    formData.set("queueId", queueId)
    formData.set("organizationId", organizationId)
    formData.set("orgSlug", orgSlug)

    try {
      const res = await updateCounterAction(formData)
      if (res.success) {
        toasts.success("Counter updated successfully!")
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
          <h2 className="text-lg font-bold text-on-surface">Edit Counter Name</h2>
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
            <Label htmlFor="name">Counter Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={counter.name}
              placeholder="E.g., Counter 1, Window A, Reception Desk"
              className="rounded-xl h-11 border-0 bg-surface-container text-on-surface focus-visible:ring-2 outline outline-1 outline-outline-variant transition-all"
              required
              disabled={isLoading}
            />
          </div>

          {/* Services list checkboxes */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/80">Authorized Services</Label>
            <p className="text-[11px] text-on-surface-variant leading-normal">
              Select which services this counter handles. If none are selected, it serves all services by default.
            </p>
            {services.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mt-1 bg-surface-container/50 p-3 rounded-xl border border-border/60">
                {services.map((srv) => {
                  const isChecked = counter.services?.some((s) => s.id === srv.id) ?? false
                  return (
                    <label
                      key={srv.id}
                      className="flex items-center gap-2 text-xs text-on-surface cursor-pointer select-none py-1 hover:text-primary transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="serviceIds"
                        value={srv.id}
                        defaultChecked={isChecked}
                        disabled={isLoading}
                        className="rounded border-outline text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer accent-primary"
                      />
                      <span className="font-medium truncate">{srv.name} ({srv.prefix})</span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic">No services configured for this queue.</p>
            )}
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
