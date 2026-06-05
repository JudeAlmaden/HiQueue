import Link from "next/link"
import { Monitor, Tag, Users } from "lucide-react"
import { UserMenu } from "@/components/portal/UserMenu"
import type { OrgPortalContext } from "@/lib/portal-theme"
import { Logo } from "@/components/Logo"

interface PortalHeaderProps {
  org: Pick<OrgPortalContext, "name" | "slug">
  role?: string
  userName?: string | null
  userEmail?: string | null
  signOutAction: () => Promise<void>
}

export function PortalHeader({
  org,
  role,
  userName,
  userEmail,
  signOutAction,
}: PortalHeaderProps) {
  const isManager = role === "owner" || role === "admin"

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6 min-w-0">
          <Link href={`/org/${org.slug}/counter`} className="flex items-center gap-3 shrink-0">
            <Logo variant="icon-only" size="md" />
            <div className="hidden sm:block min-w-0">
              <span className="text-sm font-bold tracking-tight text-on-surface block truncate">
                {org.name}
              </span>
              <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest leading-none">
                Staff Portal
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href={`/org/${org.slug}/counter`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors"
            >
              <Monitor className="h-3.5 w-3.5" />
              Counters
            </Link>
            {isManager && (
              <>
                <Link
                  href={`/org/${org.slug}/services`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors"
                >
                  <Tag className="h-3.5 w-3.5" />
                  Services
                </Link>
                <Link
                  href={`/org/${org.slug}/staff`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors"
                >
                  <Users className="h-3.5 w-3.5" />
                  Staff
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right: user menu */}
        <div className="flex items-center gap-2 shrink-0">
          <UserMenu
            role={role ?? "staff"}
            userName={userName}
            userEmail={userEmail}
            signOutAction={signOutAction}
          />
        </div>
      </div>
    </header>
  )
}
