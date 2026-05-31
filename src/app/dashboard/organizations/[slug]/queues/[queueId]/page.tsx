import { auth } from "@/auth"
import { getOrganizationBySlugWithDetails } from "@/server/services/organization.service"
import { getQueueById } from "@/server/services/queue.service"
import { notFound, redirect } from "next/navigation"
import { QueueDetailClient } from "./QueueDetailClient"

interface Props {
  params: Promise<{ slug: string; queueId: string }>
}

export default async function OrgQueueDetailPage({ params }: Props) {
  const { slug, queueId } = await params
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect("/login")

  // Fetch organization
  const orgRes = await getOrganizationBySlugWithDetails(slug)
  if (!orgRes.success) notFound()
  const org = orgRes.data

  // Verify membership
  const currentMembership = org.memberships.find((m) => m.user.id === userId)
  if (!currentMembership) notFound()

  // Fetch queue
  const queueRes = await getQueueById(queueId)
  if (!queueRes.success) notFound()
  const queue = queueRes.data

  return (
    <QueueDetailClient
      queue={queue}
      currentUserRole={currentMembership.role}
      organizationId={org.id}
      orgSlug={org.slug}
    />
  )
}
