import { db } from "@/server/lib/db"

export function isWorkspaceOwner(_createdById: string | null | undefined): boolean {
  return true
}

export async function getStaffPortalLoginPath(userId: string): Promise<string | null> {
  const staff = await db.staffUser.findUnique({
    where: { id: userId },
    include: { organization: { select: { slug: true } } },
  })

  if (!staff) return null
  return `/org/${staff.organization.slug}/login`
}

export async function requireWorkspaceOwner(userId: string): Promise<{
  allowed: boolean
  staffPortalPath: string | null
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!user) {
    const staffPortalPath = await getStaffPortalLoginPath(userId)
    return { allowed: false, staffPortalPath }
  }

  return { allowed: true, staffPortalPath: null }
}
