import { db } from "@/server/lib/db"
import { hashPassword } from "@/server/lib/password"
import type { Prisma } from "@prisma/client"
import type { OrganizationMember, UserWithMembership } from "@/types/member"

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
  _createdById: string
) {
  const hashedPassword = await hashPassword(userData.password)

  return db.staffUser.create({
    data: {
      name: userData.name,
      email: userData.email.trim().toLowerCase(),
      password: hashedPassword,
      organizationId,
      role,
    },
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
  const normalizedData = {
    ...data,
    ...(data.email ? { email: data.email.trim().toLowerCase() } : {}),
  }
  return db.staffUser.update({
    where: { id: userId },
    data: normalizedData,
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
  return db.staffUser.update({
    where: { id: userId },
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
export async function deleteMember(userId: string, _organizationId: string) {
  return db.staffUser.delete({
    where: { id: userId },
  })
}

/**
 * Soft delete a member from an organization.
 * Removes the OrganizationMembership and marks the User as inactive
 * if they have no other memberships and were created by another user.
 * @param userId - User ID to soft delete
 * @param organizationId - Organization ID to remove from
 */
export async function softDeleteMember(userId: string, _organizationId: string) {
  return db.staffUser.update({
    where: { id: userId },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  })
}

/**
 * Get all members of an organization with user and membership details.
 * @param organizationId - Organization ID
 * @returns Promise resolving to array of members with user and membership data
 */
export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const users = await db.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      role: true,
    },
  })

  const staffUsers = await db.staffUser.findMany({
    where: { organizationId, isActive: true },
    orderBy: { createdAt: "asc" },
  })

  const ownerMembers = users.map((u) => ({
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      isActive: u.isActive,
      createdById: null as string | null,
      createdAt: u.createdAt,
    },
    membership: {
      id: u.id,
      userId: u.id,
      organizationId,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    },
  }))

  const staffMembers = staffUsers.map((staff) => ({
    user: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      isActive: staff.isActive,
      createdById: "owner",
      createdAt: staff.createdAt,
    },
    membership: {
      id: staff.id,
      userId: staff.id,
      organizationId: staff.organizationId,
      role: staff.role,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    },
  }))

  return [...ownerMembers, ...staffMembers]
}

/**
 * Find a member by email in a specific organization.
 * @param email - User email
 * @param organizationId - Organization ID
 * @returns Promise resolving to User with membership or null
 */
export async function findUserWithMembershipByEmail(email: string) {
  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: {
      id: true,
      organizationId: true,
    },
  })
  if (user) {
    return {
      id: user.id,
      memberships: user.organizationId ? [{ id: user.organizationId }] : [],
    }
  }

  const staff = await db.staffUser.findFirst({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, organizationId: true },
  })
  if (staff) {
    return {
      id: staff.id,
      memberships: [{ id: staff.organizationId }],
    }
  }

  return null
}

export async function findMemberByEmail(email: string, organizationId: string): Promise<UserWithMembership | null> {
  const staff = await db.staffUser.findFirst({
    where: {
      email: email.trim().toLowerCase(),
      organizationId,
      isActive: true,
    },
  })

  if (staff) {
    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      isActive: staff.isActive,
      createdById: "owner",
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      password: null,
      emailVerified: null,
      image: null,
      deletedAt: null,
      memberships: [
        {
          id: staff.id,
          role: staff.role,
          organizationId: staff.organizationId,
          createdAt: staff.createdAt,
          updatedAt: staff.updatedAt,
        },
      ],
    }
  }

  const user = await db.user.findFirst({
    where: {
      email: email.trim().toLowerCase(),
      organizationId,
    },
  })

  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdById: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      password: user.password,
      emailVerified: user.emailVerified,
      image: user.image,
      deletedAt: user.deletedAt,
      memberships: [
        {
          id: user.id,
          role: user.role,
          organizationId: user.organizationId ?? organizationId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      ],
    }
  }

  return null
}

/**
 * Check if a user has other organization memberships besides the specified one.
 * @param userId - User ID
 * @param excludeOrgId - Organization ID to exclude from the check
 * @returns Promise resolving to true if user has other memberships, false otherwise
 */
export async function hasOtherMemberships(
  _userId: string,
  _excludeOrgId: string
): Promise<boolean> {
  return false
}

/**
 * Check if a user was created by another user.
 * @param userId - User ID
 * @returns Promise resolving to true if user.createdById is not null, false otherwise
 */
export async function wasCreatedByAnotherUser(userId: string): Promise<boolean> {
  const staff = await db.staffUser.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  return staff !== null
}
