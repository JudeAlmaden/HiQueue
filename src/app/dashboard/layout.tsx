import { auth, signOut } from "@/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Layers, LogOut } from "lucide-react"
import { requireWorkspaceOwner } from "@/server/lib/account-access"
import { getUserOrganizationWithDetails } from "@/server/services/organization.service"
import SidebarNav from "./SidebarNav"
import { SidebarFooter } from "./SidebarFooter"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const access = await requireWorkspaceOwner(userId)
  if (!access.allowed) {
    redirect(access.staffPortalPath ?? "/login?error=staff")
  }

  const orgResult = await getUserOrganizationWithDetails(userId)
  const organization = orgResult.success ? orgResult.data : null

  if (!organization) {
    redirect("/onboarding")
  }

  // Load organization's portal theme
  const { getOrgPortalBySlug } = await import("@/server/repositories/portal.repo")
  const orgPortal = await getOrgPortalBySlug(organization.slug)
  
  const orgThemeClass = orgPortal?.theme.themeClass ?? ""
  // Only apply custom CSS variables if they exist AND we're using theme-custom
  const shouldApplyCustomVars = orgThemeClass === "theme-custom" && orgPortal?.theme.cssVars
  const customThemeStyle = shouldApplyCustomVars ? orgPortal.theme.cssVars : {}

  const userEmail = session?.user?.email || "User"
  const userInitials = userEmail.substring(0, 2).toUpperCase()

  return (
    <div className={`flex min-h-screen bg-background text-foreground transition-colors duration-200 ${orgThemeClass}`} style={customThemeStyle}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-surface transition-colors duration-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo / Header */}
          <div className="flex items-center justify-between px-6 pb-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-on-primary font-bold shadow-md">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">
                HiQueue
              </span>
            </div>
            <ThemeToggle />
          </div>

          {/* Nav Links */}
          <div className="mt-6 flex-grow overflow-y-auto">
            <SidebarNav organization={organization} />
          </div>
        </div>

        <SidebarFooter
          userEmail={userEmail}
          userInitials={userInitials}
          organizationName={organization.name}
          signOutAction={async () => {
            "use server"
            await signOut()
          }}
        />
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1 w-full">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 flex md:hidden items-center justify-between h-16 px-4 border-b border-border bg-surface transition-colors">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-on-surface">
              HiQueue
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-on-surface-variant">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
