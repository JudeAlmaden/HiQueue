import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { getOrgPortalBySlug, verifyOrgMembership } from "@/server/repositories/portal.repo"
import { db } from "@/server/lib/db"
import { StaffAssignmentManager } from "@/components/assignments/StaffAssignmentManager"
import { Monitor } from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function StaffManagementPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) notFound()

  const org = await getOrgPortalBySlug(slug)
  if (!org) notFound()

  const membership = await verifyOrgMembership(userId, org.id)
  if (!membership) notFound()

  const role = membership.role
  const isManager = role === "owner" || role === "admin"

  if (!isManager) {
    redirect(`/org/${slug}/counter`)
  }

  // Fetch memberships
  const orgMemberships = await db.organizationMembership.findMany({
    where: { organizationId: org.id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  // Fetch counters
  const allCounters = await db.counter.findMany({
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          Staff Portal
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
          Staff & Roles
        </h1>
        <p className="text-sm text-on-surface-variant max-w-xl">
          Manage workspace team members, assign staff roles, and allocate counters.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left/Main Column: Staff Assignment */}
        <div className="lg:col-span-12 space-y-6">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/40 pb-3">
              <Monitor className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-on-surface">Counter Assignments</h2>
            </div>
            <StaffAssignmentManager
              members={orgMemberships}
              counters={allCounters}
              currentUserRole={role}
              organizationId={org.id}
              orgSlug={slug}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
