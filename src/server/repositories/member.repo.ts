import { db } from "@/server/lib/db"
import { hashPassword } from "@/server/lib/password"

/**
 * Member repository — handles User and OrganizationMembership operations.
 * Provides data access for member management functionality.
 */

/**
 * Create a new member with User and OrganizationMembership in a transaction.
 * @param userData - User data (name, email, password)
 * @param organizationId - Organization ID to create membership for
 * @param role - Member role (owner, admin, staff)
 * @param createdById - ID of the user creating this member
 * @returns Promise resolving to the created User with membership
 */
export async function createMember(
  userData: {
    name: string
    email: string
    password: string
  },
  organizationId: string,
  role: string,
  createdById: string
) {
  const hashedPassword = await hashPassword(userData.password)

  return db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        createdById,
      },
    })

    await tx.organizationMembership.create({
      data: {
        userId: user.id,
        organizationId,
        role,
      },
    })

    return user
  })
}

/**
 * Update a member's user data (name and/or email).
 * @param userId - User ID to update
 * @param data - Updated user data
 * @returns Promise resolving to the updated User
 */
export async function updateMemberUser(
  userId: string,
  data: {
    name?: string
    email?: string
  }
) {
  return db.user.update({
    where: { id: userId },
    data,
  })
}

/**
 * Update a member's role in an organization.
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @param role - New role (owner, admin, staff)
 * @returns Promise resolving to the updated OrganizationMembership
 */
export async function updateMemberRole(
  userId: string,
  organizationId: string,
  role: string
) {
  return db.organizationMembership.update({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    data: { role },
  })
}

/**
 * Delete a member from an organization.
 * Removes the OrganizationMembership and conditionally deletes the User
 * if they have no other memberships and were created by another user.
 * @param userId - User ID to remove
 * @param organizationId - Organization ID to remove from
 */
export async function deleteMember(userId: string, organizationId: string) {
  return db.$transaction(async (tx) => {
    // Delete the membership
    await tx.organizationMembership.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    })

    // Check if user has other memberships
    const otherMemberships = await tx.organizationMembership.findFirst({
      where: {
        userId,
        organizationId: { not: organizationId },
      },
    })

    // If no other memberships, check if user was created by another user
    if (!otherMemberships) {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { createdById: true },
      })

      // Delete user if they were created by another user (staff member)
      if (user?.createdById) {
        await tx.user.delete({
          where: { id: userId },
        })
      }
    }
  })
}

/**
 * Soft delete a member from an organization.
 * Removes the OrganizationMembership and marks the User as inactive
 * if they have no other memberships and were created by another user.
 * @param userId - User ID to soft delete
 * @param organizationId - Organization ID to remove from
 */
export async function softDeleteMember(userId: string, organizationId: string) {
  return db.$transaction(async (tx) => {
    // Delete the membership
    await tx.organizationMembership.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    })

    // Check if user has other memberships
    const otherMemberships = await tx.organizationMembership.findFirst({
      where: {
        userId,
        organizationId: { not: organizationId },
      },
    })

    // If no other memberships, soft delete the user
    if (!otherMemberships) {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { createdById: true },
      })

      // Soft delete user if they were created by another user (staff member)
      if (user?.createdById) {
        await tx.user.update({
          where: { id: userId },
          data: {
            isActive: false,
            deletedAt: new Date(),
          },
        })
      }
    }
  })
}

/**
 * Get all members of an organization with user and membership details.
 * @param organizationId - Organization ID
 * @returns Promise resolving to array of members with user and membership data
 */
export async function getOrganizationMembers(organizationId: string) {
  const memberships = await db.organizationMembership.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdById: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return memberships.map((membership) => ({
    user: membership.user,
    membership: {
      id: membership.id,
      userId: membership.userId,
      organizationId: membership.organizationId,
      role: membership.role,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    },
  }))
}

/**
 * Find a member by email in a specific organization.
 * @param email - User email
 * @param organizationId - Organization ID
 * @returns Promise resolving to User with membership or null
 */
export async function findUserWithMembershipByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
    select: {
      id: true,
      memberships: { select: { id: true } },
    },
  })
}

export async function findMemberByEmail(email: string, organizationId: string) {
  return db.user.findFirst({
    where: {
      email,
      memberships: {
        some: { organizationId },
      },
    },
    include: {
      memberships: {
        where: { organizationId },
        select: {
          id: true,
          role: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })
}

/**
 * Check if a user has other organization memberships besides the specified one.
 * @param userId - User ID
 * @param excludeOrgId - Organization ID to exclude from the check
 * @returns Promise resolving to true if user has other memberships, false otherwise
 */
export async function hasOtherMemberships(
  userId: string,
  excludeOrgId: string
): Promise<boolean> {
  const count = await db.organizationMembership.count({
    where: {
      userId,
      organizationId: { not: excludeOrgId },
    },
  })

  return count > 0
}

/**
 * Check if a user was created by another user.
 * @param userId - User ID
 * @returns Promise resolving to true if user.createdById is not null, false otherwise
 */
export async function wasCreatedByAnotherUser(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { createdById: true },
  })

  return user?.createdById !== null
}
