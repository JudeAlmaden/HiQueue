import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { getOrgPortalBySlug } from "@/server/repositories/portal.repo"
import { getCounterById, getAssignedStaff } from "@/server/repositories/counter.repo"
import { getQueueTickets } from "@/server/repositories/ticket.repo"
import { verifyMembership } from "@/server/repositories/assignment.repo"
import CounterConsoleClient from "./CounterConsoleClient"

interface Props {
  params: Promise<{ slug: string; counterId: string }>
}

export default async function CounterConsolePage({ params }: Props) {
  const { slug, counterId } = await params
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect(`/login?callbackUrl=/org/${slug}/counter/${counterId}`)
  }

  const org = await getOrgPortalBySlug(slug)
  if (!org) notFound()

  const counter = await getCounterById(counterId)
  if (!counter) notFound()

  // Verify access: user must be assigned to this counter OR member of organization
  const assignedStaff = await getAssignedStaff(counterId)
  const isAssigned = assignedStaff.some((staff) => staff.id === userId)
  const membership = await verifyMembership(userId, org.id)

  if (!isAssigned && !membership) {
    redirect(`/org/${slug}/counter`)
  }

  // Load initial tickets for the queue session
  const tickets = await getQueueTickets(counter.queueId)

  return (
    <CounterConsoleClient
      counter={JSON.parse(JSON.stringify(counter))}
      initialTickets={JSON.parse(JSON.stringify(tickets))}
      orgSlug={slug}
      orgName={org.name}
    />
  )
}
