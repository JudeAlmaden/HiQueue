import { db } from "@/server/lib/db"

export type OrganizationRole = "owner" | "admin" | "staff"

const ORGANIZATION_ROLES = ["owner", "admin", "staff"] as const

export function isOrganizationRole(role: string | null | undefined): role is OrganizationRole {
  return ORGANIZATION_ROLES.includes(role as OrganizationRole)
}

export async function getOrganizationRole(
  userId: string,
  organizationId: string
): Promise<OrganizationRole | null> {
  const membership = await db.organizationMembership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
    select: { role: true },
  })

  return isOrganizationRole(membership?.role) ? membership.role : null
}

export async function hasOrganizationRole(
  userId: string,
  organizationId: string,
  roles: OrganizationRole[]
): Promise<boolean> {
  const role = await getOrganizationRole(userId, organizationId)
  return role !== null && roles.includes(role)
}

export function canSetServiceActive(role: OrganizationRole | null, isActive: boolean): boolean {
  if (role === "owner") return true
  if (role === "admin") return isActive === false
  return false
}
