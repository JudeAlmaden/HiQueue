import { auth } from "@/auth"
import { getOrganizationBySlugWithDetails } from "@/server/services/organization.service"
import { notFound, redirect } from "next/navigation"
import { db } from "@/server/lib/db"
import { StaffAssignmentManager } from "@/components/assignments/StaffAssignmentManager"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OrgAssignmentsPage({ params }: Props) {
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

  // Fetch all counters across all queues with their assigned staff
  const counters = await db.counter.findMany({
    where: {
      queue: {
        organizationId: org.id,
      },
    },
    include: {
      assignedStaff: {
        select: {
          id: true,
        },
      },
      queue: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  // Filter staff members to assign
  // Usually, owners, admins, and staff can all be assigned to counters, but we can list everyone.
  const members = org.memberships

  return (
    <StaffAssignmentManager
      members={members}
      counters={counters}
      currentUserRole={currentMembership.role}
      organizationId={org.id}
      orgSlug={org.slug}
    />
  )
}
