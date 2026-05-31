"use client"

import { useState } from "react"
import { Layers } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createOrganizationAction } from "@/server/actions/organization.action"

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground transition-colors">
      <div className="w-full max-w-md space-y-8 bg-surface p-8 rounded-[16px] border border-outline-variant/30 shadow-[0_8px_30px_rgba(44,74,62,0.08)]">
        
        {/* Header */}
        <div className="flex flex-col space-y-3 items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary font-bold shadow-lg mb-2">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            Set up your workspace
          </h1>
          <p className="text-sm text-on-surface-variant max-w-sm">
            Welcome to HiQueue! Since you're new here, let's create a workspace for your business.
          </p>
        </div>

        {error && (
          <div className="rounded-xl p-4 text-sm bg-error-container text-on-error-container border border-error">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          action={async (formData) => {
            setIsLoading(true)
            setError(null)
            const res = await createOrganizationAction(formData)
            if (res && !res.success) {
              setError(res.error)
              setIsLoading(false)
            }
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-on-surface-variant tracking-wide">
              Organization Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Acme Health Clinic"
              className="rounded-xl h-12 text-sm border-0 focus-visible:ring-2 bg-surface-container text-on-surface outline outline-1 outline-outline-variant transition-all"
              required
              minLength={2}
            />
          </div>

          <Button
            disabled={isLoading}
            type="submit"
            className="w-full h-12 rounded-full font-semibold text-sm transition-all shadow-lg hover:opacity-90 bg-primary text-on-primary"
          >
            {isLoading ? "Creating Workspace..." : "Create Workspace"}
          </Button>
        </form>
      </div>
    </div>
  )
}
