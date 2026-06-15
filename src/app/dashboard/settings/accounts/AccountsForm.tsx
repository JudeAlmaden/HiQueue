"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { unlinkAccount, type LinkedAccount } from "@/server/actions/account.action"
import { signIn } from "next-auth/react"
import { Loader2, CheckCircle2, AlertCircle, Unlink } from "lucide-react"

interface AccountsFormProps {
  accounts: LinkedAccount[]
}

const providerMeta: Record<string, { name: string; icon: React.ReactNode }> = {
  google: {
    name: "Google",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
}

export function AccountsForm({ accounts }: AccountsFormProps) {
  const [linkedAccounts, setLinkedAccounts] = useState(accounts)
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null)
  const [isLinking, setIsLinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isGoogleLinked = linkedAccounts.some((a) => a.provider === "google")

  const handleUnlink = async (accountId: string) => {
    setIsUnlinking(accountId)
    setError(null)
    setSuccess(null)

    const result = await unlinkAccount(accountId)

    if (result.success) {
      setLinkedAccounts((prev) => prev.filter((a) => a.id !== accountId))
      setSuccess(result.data.message)
    } else {
      setError(result.error)
    }

    setIsUnlinking(null)
  }

  const handleLinkGoogle = () => {
    setIsLinking(true)
    signIn("google", { callbackUrl: "/dashboard/settings/accounts" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Manage sign-in methods linked to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && (
          <div className="flex gap-2 rounded-lg p-3 text-sm bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex gap-2 rounded-lg p-3 text-sm bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        {/* Linked accounts list */}
        <div className="space-y-3">
          {linkedAccounts.map((account) => {
            const meta = providerMeta[account.provider] ?? {
              name: account.provider,
              icon: null,
            }
            return (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  {meta.icon}
                  <div>
                    <p className="text-sm font-medium text-foreground">{meta.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Connected {new Date(account.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUnlinking === account.id}
                  onClick={() => handleUnlink(account.id)}
                  className="text-destructive hover:text-destructive"
                >
                  {isUnlinking === account.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Unlink className="h-3.5 w-3.5 mr-1.5" />
                      Unlink
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Link new account */}
        {!isGoogleLinked && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-3">Link a new account:</p>
            <Button
              variant="outline"
              disabled={isLinking}
              onClick={handleLinkGoogle}
            >
              {isLinking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Link Google Account
                </>
              )}
            </Button>
          </div>
        )}

        {linkedAccounts.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No connected accounts. Link one above to enable social sign-in.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
