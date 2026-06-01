import { db } from "@/server/lib/db"
import { getBusinessDayBounds } from "@/server/lib/business-day"

/**
 * Counter repository — handles Counter operations.
 * Provides data access for counter management functionality.
 */

/**
 * Create a new counter.
 * @param data - Counter data (name, queueId, serviceIds)
 * @returns Promise resolving to the created Counter
 */
export async function createCounter(data: { name: string; queueId: string; serviceIds?: string[] }) {
  return db.counter.create({
    data: {
      name: data.name,
      queueId: data.queueId,
      currentTicketId: null,
      isActive: true,
      services: {
        connect: data.serviceIds?.map((id) => ({ id })) || [],
      },
    },
    include: {
      services: true,
    },
  })
}

/**
 * Update a counter's name and services.
 * @param id - Counter ID to update
 * @param data - Updated counter data
 * @returns Promise resolving to the updated Counter
 */
export async function updateCounter(id: string, data: { name: string; serviceIds?: string[] }) {
  return db.counter.update({
    where: { id },
    data: {
      name: data.name,
      services: {
        set: data.serviceIds?.map((id) => ({ id })) || [],
      },
    },
    include: {
      services: true,
    },
  })
}

/**
 * Delete a counter.
 * @param id - Counter ID to delete
 * @returns Promise resolving when deletion is complete
 */
export async function deleteCounter(id: string) {
  return db.counter.delete({
    where: { id },
  })
}

/**
 * Get all counters for a queue.
 * @param queueId - Queue ID
 * @returns Promise resolving to array of counters
 */
export async function getQueueCounters(queueId: string) {
  const { start, end } = getBusinessDayBounds()

  const todaySession = await db.queueSession.findFirst({
    where: {
      queueId,
      status: "open",
      date: {
        gte: start,
        lt: end,
      },
    },
    select: { id: true },
  })

  const counters = await db.counter.findMany({
    where: { queueId },
    include: {
      services: true,
      queue: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
      currentTicket: {
        select: {
          queueSessionId: true,
          status: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })

  return counters.map(({ currentTicket, ...counter }) => ({
    ...counter,
    currentTicketId:
      currentTicket?.queueSessionId === todaySession?.id && currentTicket?.status === "serving"
        ? counter.currentTicketId
        : null,
  }))
}

/**
 * Find a counter by name in a specific queue.
 * @param name - Counter name
 * @param queueId - Queue ID
 * @returns Promise resolving to Counter or null if not found
 */
export async function findCounterByName(name: string, queueId: string) {
  return db.counter.findFirst({
    where: {
      name,
      queueId,
    },
  })
}

/**
 * Get staff assigned to a counter.
 * @param counterId - Counter ID
 * @returns Promise resolving to array of Users assigned to the counter
 */
export async function getAssignedStaff(counterId: string) {
  const counter = await db.counter.findUnique({
    where: { id: counterId },
    include: { assignedStaff: true },
  })
  return counter?.assignedStaff ?? []
}

/**
 * Check if a counter has assigned staff.
 * @param counterId - Counter ID
 * @returns Promise resolving to true if counter has assigned staff, false otherwise
 */
export async function hasAssignedStaff(counterId: string): Promise<boolean> {
  const counter = await db.counter.findUnique({
    where: { id: counterId },
    include: {
      _count: {
        select: { assignedStaff: true },
      },
    },
  })
  return (counter?._count.assignedStaff ?? 0) > 0
}

/**
 * Get a counter by ID, including services and current ticket.
 * @param id - Counter ID
 * @returns Promise resolving to Counter or null
 */
export async function getCounterById(id: string) {
  return db.counter.findUnique({
    where: { id },
    include: {
      services: true,
      currentTicket: {
        include: {
          service: true,
        },
      },
    },
  })
}

