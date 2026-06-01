import { db } from "@/server/lib/db"

/**
 * Assignment repository — handles staff-to-counter assignment operations.
 * Provides data access for staff assignment functionality.
 */

/**
 * Assign a staff member to a counter.
 * Creates a many-to-many relationship between User and Counter.
 * @param userId - User ID of the staff member
 * @param counterId - Counter ID to assign the staff to
 * @returns Promise resolving to the updated Counter with assigned staff
 */
export async function assignStaffToCounter(userId: string, counterId: string) {
  return db.counter.update({
    where: { id: counterId },
    data: {
      assignedStaff: {
        connect: { id: userId },
      },
    },
    include: {
      assignedStaff: true,
    },
  })
}

/**
 * Unassign a staff member from a counter.
 * Removes the many-to-many relationship between User and Counter.
 * @param userId - User ID of the staff member
 * @param counterId - Counter ID to unassign the staff from
 * @returns Promise resolving to the updated Counter with assigned staff
 */
export async function unassignStaffFromCounter(
  userId: string,
  counterId: string
) {
  return db.counter.update({
    where: { id: counterId },
    data: {
      assignedStaff: {
        disconnect: { id: userId },
      },
    },
    include: {
      assignedStaff: true,
    },
  })
}

/**
 * Get all counters assigned to a staff member.
 * @param userId - User ID of the staff member
 * @returns Promise resolving to array of counters with queue information
 */
export async function getStaffCounters(userId: string) {
  return getStaffCountersForOrg(userId)
}

export async function getStaffCountersForOrg(userId: string, organizationId?: string) {
  return db.counter.findMany({
    where: {
      assignedStaff: {
        some: {
          id: userId,
        },
      },
      ...(organizationId
        ? {
            queue: {
              organizationId,
            },
          }
        : {}),
    },
    include: {
      queue: {
        select: {
          id: true,
          name: true,
          isActive: true,
          organizationId: true,
        },
      },
      services: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: {
      name: "asc",
    },
  })
}

/**
 * Verify that a user is a member of an organization.
 * @param userId - User ID to verify
 * @param organizationId - Organization ID to check membership in
 * @returns Promise resolving to the OrganizationMembership or null if not found
 */
export async function verifyMembership(
  userId: string,
  organizationId: string
) {
  return db.organizationMembership.findUnique({
    where: { userId },
  }).then((m) => (m?.organizationId === organizationId ? m : null))
}
