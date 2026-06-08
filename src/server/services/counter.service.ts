import * as counterRepo from "@/server/repositories/counter.repo"
import { ok, fail, ActionResult } from "@/server/lib/action-utils"
import { CreateCounterInput, UpdateCounterInput } from "@/server/validators/counter.validator"
import { db } from "@/server/lib/db"
import { hasOrganizationRole } from "@/server/lib/permissions"

// Counter limit per queue
const COUNTER_LIMIT = 20

async function checkOwner(userId: string, organizationId: string): Promise<boolean> {
  return hasOrganizationRole(userId, organizationId, ["owner"])
}

async function normalizeServiceIdsForQueue(serviceIds: string[] | undefined, queueId: string) {
  const uniqueServiceIds = [...new Set(serviceIds ?? [])]
  if (uniqueServiceIds.length === 0) return uniqueServiceIds

  const matchingServiceCount = await db.service.count({
    where: {
      id: { in: uniqueServiceIds },
      queueId,
    },
  })

  return matchingServiceCount === uniqueServiceIds.length ? uniqueServiceIds : null
}

/**
 * Create a new counter under a queue.
 */
export async function createCounter(
  input: CreateCounterInput,
  userId: string,
  organizationId: string
): Promise<ActionResult<unknown>> {
  try {
    const isAuthorized = await checkOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    // Verify queue belongs to organization
    const queue = await db.queue.findUnique({
      where: { id: input.queueId },
    })

    if (!queue || queue.organizationId !== organizationId) {
      return fail("Queue not found or does not belong to your organization")
    }

    // Check counter limit per queue
    const existingCounters = await db.counter.count({
      where: { queueId: input.queueId },
    })

    if (existingCounters >= COUNTER_LIMIT) {
      return fail(`Counter limit reached. You can create up to ${COUNTER_LIMIT} counters per queue.`)
    }

    const serviceIds = await normalizeServiceIdsForQueue(input.serviceIds, input.queueId)
    if (serviceIds === null) {
      return fail("One or more services do not belong to this queue")
    }

    // Check duplicate counter name in same queue
    const duplicate = await counterRepo.findCounterByName(input.name, input.queueId)
    if (duplicate) {
      return fail("A counter with this name already exists in the queue")
    }

    const counter = await counterRepo.createCounter({
      name: input.name,
      queueId: input.queueId,
      serviceIds,
    })

    return ok(counter)
  } catch (error) {
    console.error("Failed to create counter:", error)
    return fail("Failed to create counter. Please try again")
  }
}

/**
 * Update an existing counter.
 */
export async function updateCounter(
  input: UpdateCounterInput,
  userId: string,
  organizationId: string
): Promise<ActionResult<unknown>> {
  try {
    const isAuthorized = await checkOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    const counter = await db.counter.findUnique({
      where: { id: input.id },
      include: { queue: true },
    })

    if (!counter || counter.queue.organizationId !== organizationId) {
      return fail("Counter not found or does not belong to your organization")
    }

    const serviceIds = await normalizeServiceIdsForQueue(input.serviceIds, counter.queueId)
    if (serviceIds === null) {
      return fail("One or more services do not belong to this queue")
    }

    // Check duplicate counter name in same queue
    const duplicate = await counterRepo.findCounterByName(input.name, counter.queueId)
    if (duplicate && duplicate.id !== counter.id) {
      return fail("A counter with this name already exists in the queue")
    }

    const updated = await counterRepo.updateCounter(input.id, {
      name: input.name,
      serviceIds,
    })

    return ok(updated)
  } catch (error) {
    console.error("Failed to update counter:", error)
    return fail("Failed to update counter. Please try again")
  }
}

/**
 * Delete a counter.
 */
export async function deleteCounter(
  id: string,
  userId: string,
  organizationId: string
): Promise<ActionResult<void>> {
  try {
    const isAuthorized = await checkOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    const counter = await db.counter.findUnique({
      where: { id },
      include: { queue: true },
    })

    if (!counter || counter.queue.organizationId !== organizationId) {
      return fail("Counter not found or does not belong to your organization")
    }

    // Check if counter has assigned staff
    const hasStaff = await counterRepo.hasAssignedStaff(id)
    if (hasStaff) {
      return fail("Cannot delete counter with assigned staff members")
    }

    await counterRepo.deleteCounter(id)
    return ok(undefined)
  } catch (error) {
    console.error("Failed to delete counter:", error)
    return fail("Failed to delete counter. Please try again")
  }
}
