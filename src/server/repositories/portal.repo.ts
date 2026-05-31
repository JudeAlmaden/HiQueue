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
  const membership = await db.organizationMembership.findUnique({
    where: { userId },
    select: { organizationId: true, role: true },
  })

  if (!membership || membership.organizationId !== organizationId) {
    return null
  }

  return membership
}
