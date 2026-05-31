import { db } from "@/server/lib/db"

/**
 * Service repository — handles Service operations.
 * Provides data access for service management functionality.
 */

/**
 * Create a new service.
 * @param data - Service data (name, prefix, avgDurationMinutes, queueId)
 * @returns Promise resolving to the created Service
 */
export async function createService(data: {
  name: string
  prefix: string
  avgDurationMinutes?: number
  queueId: string
}) {
  return db.service.create({
    data: {
      name: data.name,
      prefix: data.prefix,
      avgDurationMinutes: data.avgDurationMinutes,
      queueId: data.queueId,
      isActive: true,
    },
  })
}

/**
 * Update a service's fields.
 * @param id - Service ID to update
 * @param data - Updated service data
 * @returns Promise resolving to the updated Service
 */
export async function updateService(
  id: string,
  data: {
    name?: string
    prefix?: string
    avgDurationMinutes?: number | null
  }
) {
  return db.service.update({
    where: { id },
    data,
  })
}

/**
 * Delete a service.
 * @param id - Service ID to delete
 * @returns Promise resolving when deletion is complete
 */
export async function deleteService(id: string) {
  return db.service.delete({
    where: { id },
  })
}

/**
 * Get all services for a queue.
 * @param queueId - Queue ID
 * @returns Promise resolving to array of services
 */
export async function getQueueServices(queueId: string) {
  return db.service.findMany({
    where: { queueId },
    orderBy: { name: "asc" },
  })
}

/**
 * Find a service by prefix in a specific queue.
 * @param prefix - Service prefix
 * @param queueId - Queue ID
 * @returns Promise resolving to Service or null if not found
 */
export async function findServiceByPrefix(prefix: string, queueId: string) {
  return db.service.findFirst({
    where: {
      prefix,
      queueId,
    },
  })
}

/**
 * Find a service by name in a specific queue.
 * @param name - Service name
 * @param queueId - Queue ID
 * @returns Promise resolving to Service or null if not found
 */
export async function findServiceByName(name: string, queueId: string) {
  return db.service.findFirst({
    where: {
      name,
      queueId,
    },
  })
}

/**
 * Count active tickets for a service.
 * Active tickets are those with status "waiting" or "serving".
 * @param serviceId - Service ID
 * @returns Promise resolving to the count of active tickets
 */
export async function countActiveTicketsForService(
  serviceId: string
): Promise<number> {
  return db.ticket.count({
    where: {
      serviceId,
      status: {
        in: ["waiting", "serving"],
      },
    },
  })
}
