import Link from "next/link"
import { Layers, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { signOut } from "@/auth"
import type { OrgPortalContext } from "@/lib/portal-theme"

interface PortalHeaderProps {
  org: Pick<OrgPortalContext, "name" | "slug">
}

export function PortalHeader({ org }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href={`/org/${org.slug}/counter`} className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-md">
            <Layers className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold tracking-tight text-on-surface block truncate">
              {org.name}
            </span>
            <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest leading-none">
              Staff Portal
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: `/org/${org.slug}/login` })
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-error h-9 px-3 rounded-full hover:bg-error/5"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
