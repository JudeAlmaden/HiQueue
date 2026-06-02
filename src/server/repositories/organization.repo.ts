import { db } from "@/server/lib/db"

export async function createOrganization(data: { name: string, slug: string }, userId: string) {
  return db.organization.create({
    data: {
      name: data.name,
      slug: data.slug,
      memberships: {
        create: {
          userId,
          role: "owner"
        }
      }
    }
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
  memberships: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  queues: {
    include: {
      counters: true,
    },
  },
} as const

export async function userHasOrganization(userId: string) {
  const membership = await db.organizationMembership.findUnique({
    where: { userId },
    select: { id: true },
  })
  return membership !== null
}

export async function getUserOrganization(userId: string) {
  return db.organization.findFirst({
    where: {
      memberships: {
        some: { userId },
      },
    },
  })
}

export async function getUserOrganizationWithDetails(userId: string) {
  return db.organization.findFirst({
    where: {
      memberships: {
        some: { userId },
      },
    },
    include: organizationWithDetailsInclude,
  })
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
  return db.organization.findUnique({
    where: { slug },
    include: {
      memberships: {
        include: {
          user: {
            select: { id: true, name: true, email: true, createdAt: true }
          }
        },
        orderBy: { createdAt: "asc" }
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
}

export async function findMemberByEmail(email: string, organizationId: string) {
  return db.user.findFirst({
    where: {
      email,
      memberships: {
        some: { organizationId }
      }
    },
    include: {
      memberships: {
        where: { organizationId },
        select: { role: true }
      }
    }
  })
}
