import { auth } from "@/auth"
import { getOrganizationBySlugWithDetails } from "@/server/services/organization.service"
import { notFound, redirect } from "next/navigation"
import { MembersManager } from "./MembersManager"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OrgMembersPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect("/login")

  const res = await getOrganizationBySlugWithDetails(slug)
  if (!res.success) notFound()

  const org = res.data

  // Verify membership
  const currentMembership = org.memberships.find((m) => m.user.id === userId)
  if (!currentMembership) notFound()

  return (
    <MembersManager
      memberships={org.memberships}
      currentUserId={userId}
      currentUserRole={currentMembership.role}
      organizationId={org.id}
      orgSlug={org.slug}
    />
  )
}
