import { auth } from "@/auth"
import { getOrganizationBySlugWithDetails } from "@/server/services/organization.service"
import { notFound, redirect } from "next/navigation"
import { QueuesManager } from "./QueuesManager"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OrgQueuesPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect("/login")

  const res = await getOrganizationBySlugWithDetails(slug)
  if (!res.success) notFound()

  const org = res.data

  // Verify membership
  const currentMembership = org.memberships.find((m) => m.user.id === userId)
  if (!currentMembership) {
    // User is not a member of this organization, redirect to their own dashboard
    redirect("/dashboard")
  }

  return (
    <QueuesManager
      queues={org.queues}
      currentUserRole={currentMembership.role}
      organizationId={org.id}
      orgSlug={org.slug}
    />
  )
}
