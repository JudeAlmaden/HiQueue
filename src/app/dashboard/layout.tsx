import { auth, signOut } from "@/auth"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LogOut, Palette } from "lucide-react"
import { requireWorkspaceOwner } from "@/server/lib/account-access"
import { getUserOrganizationWithDetails } from "@/server/services/organization.service"
import SidebarNav from "./SidebarNav"
import { SidebarFooter } from "./SidebarFooter"
import { Logo } from "@/components/Logo"

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
  const orgModeClass = orgThemeClass !== "theme-custom" && orgPortal?.theme.mode === "dark" ? "dark" : ""
  // Only apply custom CSS variables if they exist AND we're using theme-custom
  const shouldApplyCustomVars = orgThemeClass === "theme-custom" && orgPortal?.theme.cssVars
  const customThemeStyle = shouldApplyCustomVars ? orgPortal.theme.cssVars : {}

  const userEmail = session?.user?.email || "User"
  const userInitials = userEmail.substring(0, 2).toUpperCase()

  return (
    <div className={`flex min-h-screen bg-background text-foreground transition-colors duration-200 ${orgThemeClass} ${orgModeClass}`} style={customThemeStyle}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-surface transition-colors duration-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo / Header */}
          <div className="flex items-center justify-between px-6 pb-6 border-b border-border">
            <Logo variant="with-name" size="md" useImage />
            <Link
              href={`/dashboard/organizations/${organization.slug}/portal?tab=theme`}
              aria-label="Change theme"
              className={buttonVariants({ variant: "ghost", size: "icon", className: "h-9 w-9 text-on-surface-variant hover:text-on-surface hover:bg-surface-container" })}
            >
              <Palette className="h-4 w-4" />
            </Link>
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
          <Logo variant="with-name" size="sm" useImage />
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/organizations/${organization.slug}/portal?tab=theme`}
              aria-label="Change theme"
              className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-on-surface-variant hover:text-on-surface hover:bg-surface-container" })}
            >
              <Palette className="h-4 w-4" />
            </Link>
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-on-surface-variant hover:text-error">
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
