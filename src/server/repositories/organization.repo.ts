import { db } from "@/server/lib/db"
import type { Prisma } from "@prisma/client"

export async function createOrganization(data: { name: string, slug: string }, userId: string) {
  return db.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    })
    await tx.user.update({
      where: { id: userId },
      data: {
        organizationId: org.id,
        role: "owner",
      },
    })
    return org
  })
}

export async function updateOrganization(id: string, data: { name: string }) {
  const slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
  return db.organization.update({
    where: { id },
    data: { name: data.name, slug },
  })
}

export async function deleteOrganization(id: string) {
  return db.organization.delete({ where: { id } })
}

const organizationWithDetailsInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  queues: {
    include: {
      counters: true,
    },
  },
} as const

export async function userHasOrganization(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  })
  if (user?.organizationId) return true
 
  const staff = await db.staffUser.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  return staff !== null
}

export async function getUserOrganization(userId: string) {
  const ownerOrg = await db.organization.findFirst({
    where: {
      user: { id: userId },
    },
  })
  if (ownerOrg) return ownerOrg
 
  const staff = await db.staffUser.findUnique({
    where: { id: userId },
    include: { organization: true },
  })
  return staff?.organization || null
}

export async function getUserOrganizationWithDetails(userId: string) {
  const ownerOrg = await db.organization.findFirst({
    where: {
      user: { id: userId },
    },
    include: organizationWithDetailsInclude,
  })
 
  let org = ownerOrg
 
  if (!org) {
    const staff = await db.staffUser.findUnique({
      where: { id: userId },
      include: {
        organization: {
          include: organizationWithDetailsInclude,
        },
      },
    })
    org = staff?.organization || null
  }
 
  if (!org) return null
 
  const ownerMembership = org.user ? [{
    id: org.user.id,
    userId: org.user.id,
    organizationId: org.id,
    role: org.user.role,
    createdAt: org.user.createdAt,
    updatedAt: org.user.updatedAt,
    user: {
      id: org.user.id,
      name: org.user.name,
      email: org.user.email,
    },
  }] : []

  // Fetch staff users
  const staffUsers = await db.staffUser.findMany({
    where: { organizationId: org.id, isActive: true },
    orderBy: { createdAt: "asc" },
  })
 
  const staffMemberships = staffUsers.map((s) => ({
    id: s.id,
    userId: s.id,
    organizationId: s.organizationId,
    role: s.role,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    user: {
      id: s.id,
      name: s.name,
      email: s.email,
    },
  }))
 
  return {
    ...org,
    memberships: [...ownerMembership, ...staffMemberships],
  }
}

/** @deprecated Use getUserOrganization — users belong to at most one org */
export async function getUserOrganizations(userId: string) {
  const org = await getUserOrganization(userId)
  return org ? [org] : []
}

/** @deprecated Use getUserOrganizationWithDetails — users belong to at most one org */
export async function getUserOrganizationsWithDetails(userId: string) {
  const org = await getUserOrganizationWithDetails(userId)
  return org ? [org] : []
}

export async function findOrganizationBySlug(slug: string) {
  return db.organization.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  })
}

export async function findOrganizationBySlugWithDetails(slug: string) {
  const org = await db.organization.findUnique({
    where: { slug },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
      },
      queues: {
        include: { 
          counters: true,
          _count: {
            select: {
              services: true,
              counters: true,
            }
          }
        },
        orderBy: { createdAt: "asc" }
      },
    }
  })
 
  if (!org) return null
 
  const ownerMembership = org.user ? [{
    id: org.user.id,
    userId: org.user.id,
    organizationId: org.id,
    role: org.user.role,
    createdAt: org.user.createdAt,
    updatedAt: org.user.updatedAt,
    user: {
      id: org.user.id,
      name: org.user.name,
      email: org.user.email,
      createdAt: org.user.createdAt,
    }
  }] : []

  // Fetch staff users
  const staffUsers = await db.staffUser.findMany({
    where: { organizationId: org.id, isActive: true },
    orderBy: { createdAt: "asc" },
  })
 
  const staffMemberships = staffUsers.map((s) => ({
    id: s.id,
    userId: s.id,
    organizationId: s.organizationId,
    role: s.role,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    user: {
      id: s.id,
      name: s.name,
      email: s.email,
      createdAt: s.createdAt,
    }
  }))
 
  return {
    ...org,
    memberships: [...ownerMembership, ...staffMemberships]
  }
}

export async function findMemberByEmail(email: string, organizationId: string) {
  const staff = await db.staffUser.findFirst({
    where: { email, organizationId, isActive: true },
  })
  if (staff) {
    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      memberships: [
        {
          role: staff.role,
        },
      ],
    } as unknown as { id: string; name: string | null; email: string | null; memberships: { role: string }[] }
  }
 
  const user = await db.user.findFirst({
    where: {
      email,
      organizationId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    }
  })
 
  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      memberships: [
        {
          role: user.role,
        }
      ]
    } as unknown as { id: string; name: string | null; email: string | null; memberships: { role: string }[] }
  }

  return null
}
