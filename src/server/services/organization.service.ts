import * as orgRepo from "@/server/repositories/organization.repo"
import { ok, fail } from "@/server/lib/action-utils"
import { CreateOrganizationInput, UpdateOrganizationInput } from "@/server/validators/organization"

export async function createOrganization(input: CreateOrganizationInput, userId: string) {
  try {
    if (await orgRepo.userHasOrganization(userId)) {
      return fail("You already belong to an organization")
    }

    const slug = input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)
    const org = await orgRepo.createOrganization({ name: input.name, slug }, userId)
    return ok(org)
  } catch {
    return fail("Failed to create organization")
  }
}

export async function updateOrganization(input: UpdateOrganizationInput, userId: string) {
  try {
    const { db } = await import("@/server/lib/db")
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    })
    if (!user || user.organizationId !== input.id || user.role !== "owner") {
      return fail("You don't have permission to update this organization")
    }
    const org = await orgRepo.updateOrganization(input.id, { name: input.name })
    return ok(org)
  } catch {
    return fail("Failed to update organization")
  }
}

export async function deleteOrganization(id: string, userId: string) {
  try {
    const { db } = await import("@/server/lib/db")
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    })
    if (!user || user.organizationId !== id || user.role !== "owner") {
      return fail("You don't have permission to delete this organization")
    }
    await orgRepo.deleteOrganization(id)
    return ok(undefined)
  } catch {
    return fail("Failed to delete organization")
  }
}

export async function getUserOrganization(userId: string) {
  try {
    const org = await orgRepo.getUserOrganization(userId)
    return ok(org)
  } catch {
    return fail("Failed to fetch organization")
  }
}

export async function getUserOrganizationWithDetails(userId: string) {
  try {
    const org = await orgRepo.getUserOrganizationWithDetails(userId)
    return ok(org)
  } catch {
    return fail("Failed to fetch organization")
  }
}

/** @deprecated Use getUserOrganization */
export async function getUserOrganizations(userId: string) {
  const res = await getUserOrganization(userId)
  if (!res.success) return res
  return ok(res.data ? [res.data] : [])
}

/** @deprecated Use getUserOrganizationWithDetails */
export async function getUserOrganizationsWithDetails(userId: string) {
  const res = await getUserOrganizationWithDetails(userId)
  if (!res.success) return res
  return ok(res.data ? [res.data] : [])
}

export async function getOrganizationBySlug(slug: string) {
  try {
    const org = await orgRepo.findOrganizationBySlug(slug)
    if (!org) return fail("Organization not found")
    return ok(org)
  } catch {
    return fail("Failed to fetch organization")
  }
}

export async function getOrganizationBySlugWithDetails(slug: string) {
  try {
    const org = await orgRepo.findOrganizationBySlugWithDetails(slug)
    if (!org) return fail("Organization not found")
    return ok(org)
  } catch {
    return fail("Failed to fetch organization")
  }
}

