import { db } from "@/server/lib/db"

/**
 * Queue repository — handles Queue operations.
 * Provides data access for queue management functionality.
 */

/**
 * Create a new queue with default theme and layout.
 * @param data - Queue data (name, description, passcode, organizationId)
 * @returns Promise resolving to the created Queue
 */
export async function createQueue(data: {
  name: string
  description?: string
  passcode?: string
  organizationId: string
}) {
  return db.queue.create({
    data: {
      name: data.name,
      description: data.description,
      passcode: data.passcode,
      organizationId: data.organizationId,
      theme: "{}",
      layout: "{}",
      isActive: true,
    },
  })
}

/**
 * Update a queue's fields.
 * @param id - Queue ID to update
 * @param data - Updated queue data
 * @returns Promise resolving to the updated Queue
 */
export async function updateQueue(
  id: string,
  data: {
    name?: string
    description?: string | null
    passcode?: string | null
    theme?: object
    layout?: object
    isActive?: boolean
  }
) {
  // Convert objects to JSON strings for SQLite compatibility
  const updateData: Record<string, unknown> = {}
  
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.passcode !== undefined) updateData.passcode = data.passcode
  if (data.theme !== undefined) updateData.theme = JSON.stringify(data.theme)
  if (data.layout !== undefined) updateData.layout = JSON.stringify(data.layout)
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  return db.queue.update({
    where: { id },
    data: updateData,
  })
}

/**
 * Delete a queue (cascades to services, counters, and queue sessions).
 * @param id - Queue ID to delete
 * @returns Promise resolving when deletion is complete
 */
export async function deleteQueue(id: string) {
  return db.queue.delete({
    where: { id },
  })
}

/**
 * Get all queues for an organization.
 * @param organizationId - Organization ID
 * @returns Promise resolving to array of queues
 */
export async function getOrganizationQueues(organizationId: string) {
  return db.queue.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  })
}

/**
 * Get a queue by ID with related data.
 * @param id - Queue ID
 * @returns Promise resolving to Queue with services and counters, or null if not found
 */
export async function getQueueById(id: string) {
  return db.queue.findUnique({
    where: { id },
    include: {
      services: {
        orderBy: { name: "asc" },
      },
      counters: {
        include: {
          services: true,
          assignedStaff: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
            },
          },
        },
        orderBy: { name: "asc" },
      },
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          portalTheme: true,
          portalBranding: true,
        },
      },
    },
  })
}

/**
 * Count active tickets for a queue.
 * Active tickets are those with status "waiting" or "serving".
 * @param queueId - Queue ID
 * @returns Promise resolving to the count of active tickets
 */
export async function countActiveTickets(queueId: string): Promise<number> {
  return db.ticket.count({
    where: {
      queueId,
      status: {
        in: ["waiting", "serving"],
      },
    },
  })
}
