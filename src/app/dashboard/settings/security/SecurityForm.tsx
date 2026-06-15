"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { changePassword } from "@/server/actions/password.action"
import { Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react"

interface SecurityFormProps {
  hasPassword: boolean
}

export function SecurityForm({ hasPassword }: SecurityFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await changePassword(formData)

    if (result.success) {
      setSuccess(result.data.message)
      ;(e.target as HTMLFormElement).reset()
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          {hasPassword
            ? "Update your password to keep your account secure."
            : "Set a password to enable email sign-in alongside Google."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasPassword && (
          <div className="flex gap-3 rounded-lg p-3 mb-5 text-sm bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              You signed in with Google and don&apos;t have a password yet. Set one below to also
              sign in with your email and password.
            </p>
          </div>
        )}

        {error && (
          <div className="flex gap-2 rounded-lg p-3 mb-5 text-sm bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex gap-2 rounded-lg p-3 mb-5 text-sm bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          {hasPassword && (
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="••••••••"
                required={hasPassword}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">
              {hasPassword ? "New password" : "Password"}
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum 8 characters with uppercase, lowercase, and a number.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">
              {hasPassword ? "Confirm new password" : "Confirm password"}
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {hasPassword ? "Updating..." : "Setting password..."}
              </>
            ) : (
              hasPassword ? "Update password" : "Set password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
