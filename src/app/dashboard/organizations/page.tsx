import { auth } from "@/auth"
import { getUserOrganizationWithDetails } from "@/server/services/organization.service"
import { redirect } from "next/navigation"
import { Building2 } from "lucide-react"
import { OrgCard } from "./OrgCard"
import { PortalCustomizationCard } from "@/components/portal/PortalCustomizationCard"

export default async function WorkspaceSettingsPage() {
  const session = await auth()
  const userId = session?.user?.id ?? ""

  const res = await getUserOrganizationWithDetails(userId)
  const org = res.success ? res.data : null

  if (!org) {
    redirect("/onboarding")
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Workspace settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your organization name and workspace details.
        </p>
      </div>

      <OrgCard org={org} currentUserId={userId} />

      <PortalCustomizationCard
        orgSlug={org.slug}
        portalLoginUrl={`/org/${org.slug}/login`}
      />

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Each account is linked to one workspace. To manage a different business, use a separate account.
        </p>
      </div>
    </div>
  )
}
