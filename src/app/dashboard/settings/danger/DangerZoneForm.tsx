"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteAccount } from "@/server/actions/dangerzone.action"
import { signOut } from "next-auth/react"
import { Loader2, AlertCircle, AlertTriangle } from "lucide-react"

export function DangerZoneForm() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState("")

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    const result = await deleteAccount(confirmEmail)

    if (result.success) {
      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" })
    } else {
      setError(result.error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account and data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <div className="flex gap-2 rounded-lg p-3 text-sm bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Delete Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently deactivate your account. Your organization and all associated data
                will become inaccessible. This action cannot be undone.
              </p>
            </div>

            {!showConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowConfirm(true)}
              >
                Delete my account
              </Button>
            ) : (
              <div className="space-y-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <p className="text-sm font-medium text-foreground">
                  Type your email address to confirm:
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmEmail" className="sr-only">Confirm email</Label>
                  <Input
                    id="confirmEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    disabled={isDeleting || !confirmEmail}
                    onClick={handleDelete}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Confirm deletion"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirm(false)
                      setConfirmEmail("")
                      setError(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
