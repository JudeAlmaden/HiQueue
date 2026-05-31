import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { PortalHeader } from "@/components/portal/PortalHeader"
import { getOrgPortalBySlug, verifyOrgMembership } from "@/server/repositories/portal.repo"

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function OrgStaffPortalLayout({ children, params }: Props) {
  const { slug } = await params
  const org = await getOrgPortalBySlug(slug)

  if (!org) notFound()

  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect(`/org/${slug}/login`)
  }

  const membership = await verifyOrgMembership(userId, org.id)
  if (!membership) {
    redirect(`/org/${slug}/login?error=AccessDenied`)
  }

  return (
    <>
      <PortalHeader org={org} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">{children}</main>
    </>
  )
}
