import { db } from "@/server/lib/db"
import {
  parsePortalBranding,
  parsePortalTheme,
  type OrgPortalContext,
} from "@/lib/portal-theme"

type OrgPortalRow = {
  id: string
  name: string
  slug: string
  portalTheme?: string
  portalBranding?: string
}

export async function getOrgPortalBySlug(slug: string): Promise<OrgPortalContext | null> {
  const org = (await db.organization.findUnique({
    where: { slug },
  })) as OrgPortalRow | null

  if (!org) return null

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    theme: parsePortalTheme(org.portalTheme ?? "{}"),
    branding: parsePortalBranding(org.portalBranding ?? "{}"),
  }
}

export async function verifyOrgMembership(userId: string, organizationId: string) {
  const staff = await db.staffUser.findUnique({
    where: { id: userId },
    select: { organizationId: true, role: true },
  })

  if (staff && staff.organizationId === organizationId) {
    return staff
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, role: true },
  })

  if (!user || user.organizationId !== organizationId) {
    return null
  }

  return user
}
