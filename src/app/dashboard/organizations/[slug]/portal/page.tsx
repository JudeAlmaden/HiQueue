import { auth } from "@/auth"
import { getUserOrganization } from "@/server/services/organization.service"
import { getOrgPortalBySlug } from "@/server/repositories/portal.repo"
import { notFound, redirect } from "next/navigation"
import { PortalCustomizer } from "@/components/portal/PortalCustomizer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portal Customization - HiQueue",
  description: "Customize your staff portal's theme, branding, and appearance",
}

export default async function PortalCustomizationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect("/login")

  // Verify user owns/is member of this org
  const userOrgRes = await getUserOrganization(userId)
  if (!userOrgRes.success || !userOrgRes.data || userOrgRes.data.slug !== slug) {
    redirect("/dashboard")
  }

  // Get portal context
  const orgPortal = await getOrgPortalBySlug(slug)
  if (!orgPortal) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">
          Staff Portal Customization
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Customize your staff portal's theme, branding, and appearance to match your organization's identity.
        </p>
      </div>

      <PortalCustomizer orgPortal={orgPortal} />
    </div>
  )
}
