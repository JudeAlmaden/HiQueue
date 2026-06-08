import * as queueRepo from "@/server/repositories/queue.repo"
import { ok, fail, ActionResult } from "@/server/lib/action-utils"
import { CreateQueueInput, UpdateQueueInput } from "@/server/validators/queue.validator"
import { db } from "@/server/lib/db"
import { hasOrganizationRole } from "@/server/lib/permissions"

async function checkOwner(userId: string, organizationId: string): Promise<boolean> {
  return hasOrganizationRole(userId, organizationId, ["owner"])
}

async function verifyQueueInOrganization(id: string, organizationId: string): Promise<boolean> {
  const queue = await db.queue.findUnique({
    where: { id },
    select: { organizationId: true },
  })

  return queue?.organizationId === organizationId
}

/**
 * Create a new queue in an organization.
 */
export async function createQueue(
  input: CreateQueueInput,
  userId: string
): Promise<ActionResult<unknown>> {
  try {
    const isAuthorized = await checkOwner(userId, input.organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    // Check duplicate name in organization
    const existingQueues = await queueRepo.getOrganizationQueues(input.organizationId)
    if (existingQueues.some((q) => q.name.toLowerCase() === input.name.toLowerCase())) {
      return fail("A queue with this name already exists in the organization")
    }

    // Check queue limit per organization (max 3 queues)
    const QUEUE_LIMIT = 3
    if (existingQueues.length >= QUEUE_LIMIT) {
      return fail(`Queue limit reached. You can create up to ${QUEUE_LIMIT} queues per organization.`)
    }

    const queue = await queueRepo.createQueue({
      name: input.name,
      description: input.description,
      passcode: input.passcode,
      organizationId: input.organizationId,
    })

    return ok(queue)
  } catch (error) {
    console.error("Failed to create queue:", error)
    return fail("Failed to create queue. Please try again")
  }
}

/**
 * Update an existing queue.
 */
export async function updateQueue(
  input: UpdateQueueInput,
  userId: string,
  organizationId: string
): Promise<ActionResult<unknown>> {
  try {
    const isAuthorized = await checkOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    const queueBelongsToOrganization = await verifyQueueInOrganization(input.id, organizationId)
    if (!queueBelongsToOrganization) {
      return fail("Queue not found or does not belong to your organization")
    }

    // Check duplicate name in organization if name is provided
    if (input.name) {
      const existingQueues = await queueRepo.getOrganizationQueues(organizationId)
      if (existingQueues.some((q) => q.id !== input.id && q.name.toLowerCase() === input.name!.toLowerCase())) {
        return fail("A queue with this name already exists in the organization")
      }
    }

    const updated = await queueRepo.updateQueue(input.id, {
      name: input.name,
      description: input.description,
      passcode: input.passcode,
      theme: input.theme,
      layout: input.layout,
    })

    return ok(updated)
  } catch (error) {
    console.error("Failed to update queue:", error)
    return fail("Failed to update queue. Please try again")
  }
}

/**
 * Open or close a queue for new tickets.
 */
export async function setQueueActive(
  id: string,
  isActive: boolean,
  userId: string,
  organizationId: string
): Promise<ActionResult<unknown>> {
  try {
    const isAuthorized = await checkOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    const queue = await db.queue.findUnique({ where: { id } })
    if (!queue || queue.organizationId !== organizationId) {
      return fail("Queue not found or does not belong to your organization")
    }

    const updated = await queueRepo.updateQueue(id, { isActive })
    return ok(updated)
  } catch (error) {
    console.error("Failed to update queue status:", error)
    return fail("Failed to update queue status. Please try again")
  }
}

/**
 * Delete a queue.
 */
export async function deleteQueue(
  id: string,
  userId: string,
  organizationId: string
): Promise<ActionResult<void>> {
  try {
    const isAuthorized = await checkOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    const queueBelongsToOrganization = await verifyQueueInOrganization(id, organizationId)
    if (!queueBelongsToOrganization) {
      return fail("Queue not found or does not belong to your organization")
    }

    // Check for active tickets
    const activeTicketCount = await queueRepo.countActiveTickets(id)
    if (activeTicketCount > 0) {
      return fail("Cannot delete queue with active tickets in progress")
    }

    await queueRepo.deleteQueue(id)
    return ok(undefined)
  } catch (error) {
    console.error("Failed to delete queue:", error)
    return fail("Failed to delete queue. Please try again")
  }
}

/**
 * Get all queues for an organization.
 */
export async function getOrganizationQueues(organizationId: string) {
  try {
    const queues = await queueRepo.getOrganizationQueues(organizationId)
    return ok(queues)
  } catch (error) {
    console.error("Failed to fetch organization queues:", error)
    return fail("Failed to fetch organization queues")
  }
}

/**
 * Get a queue by ID with detailed info.
 */
export async function getQueueById(id: string) {
  try {
    const queue = await queueRepo.getQueueById(id)
    if (!queue) {
      return fail("Queue not found")
    }
    return ok(queue)
  } catch (error) {
    console.error("Failed to fetch queue details:", error)
    return fail("Failed to fetch queue details")
  }
}
