"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const SETTINGS_HREF = "/dashboard/settings/profile"

interface SidebarFooterProps {
  userEmail: string
  userInitials: string
  organizationName: string
  signOutAction: () => Promise<void>
}

export function SidebarFooter({
  userEmail,
  userInitials,
  organizationName,
  signOutAction,
}: SidebarFooterProps) {
  const pathname = usePathname()
  const isSettingsActive =
    pathname === "/dashboard/settings" || pathname.startsWith("/dashboard/settings/")

  return (
    <div className="flex-shrink-0 border-t border-border p-4 bg-surface-low">
      <div className="flex items-center w-full gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container font-semibold text-sm">
          {userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-on-surface truncate">{userEmail}</p>
          <p className="text-[10px] text-on-surface-variant truncate">{organizationName}</p>
        </div>
        <Link
          href={SETTINGS_HREF}
          title="Settings"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isSettingsActive
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <Settings className="h-4 w-4" />
        </Link>
        <form action={signOutAction}>
          <Button
            variant="ghost"
            size="icon"
            type="submit"
            title="Sign out"
            className="h-8 w-8 text-on-surface-variant hover:text-error"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
