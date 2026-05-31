import { db } from "@/server/lib/db"

/** Workspace owners self-register at /login; staff are created by an admin (createdById set). */
export function isWorkspaceOwner(createdById: string | null | undefined): boolean {
  return createdById == null
}

export async function getStaffPortalLoginPath(userId: string): Promise<string | null> {
  const membership = await db.organizationMembership.findUnique({
    where: { userId },
    include: { organization: { select: { slug: true } } },
  })

  if (!membership) return null
  return `/org/${membership.organization.slug}/login`
}

export async function requireWorkspaceOwner(userId: string): Promise<{
  allowed: boolean
  staffPortalPath: string | null
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { createdById: true },
  })

  if (!user || !isWorkspaceOwner(user.createdById)) {
    const staffPortalPath = await getStaffPortalLoginPath(userId)
    return { allowed: false, staffPortalPath }
  }

  return { allowed: true, staffPortalPath: null }
}
