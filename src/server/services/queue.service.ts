import * as queueRepo from "@/server/repositories/queue.repo"
import { ok, fail, ActionResult } from "@/server/lib/action-utils"
import { CreateQueueInput, UpdateQueueInput } from "@/server/validators/queue.validator"
import { db } from "@/server/lib/db"

/**
 * Check if user is owner or admin in the organization.
 */
async function checkAdminOrOwner(userId: string, organizationId: string): Promise<boolean> {
  const membership = await db.organizationMembership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  })
  return !!membership && (membership.role === "owner" || membership.role === "admin")
}

/**
 * Create a new queue in an organization.
 */
export async function createQueue(
  input: CreateQueueInput,
  userId: string
): Promise<ActionResult<any>> {
  try {
    const isAuthorized = await checkAdminOrOwner(userId, input.organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    // Check duplicate name in organization
    const existingQueues = await queueRepo.getOrganizationQueues(input.organizationId)
    if (existingQueues.some((q) => q.name.toLowerCase() === input.name.toLowerCase())) {
      return fail("A queue with this name already exists in the organization")
    }

    const queue = await queueRepo.createQueue({
      name: input.name,
      description: input.description,
      passcode: input.passcode,
      organizationId: input.organizationId,
    })

    return ok(queue)
  } catch (error: any) {
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
): Promise<ActionResult<any>> {
  try {
    const isAuthorized = await checkAdminOrOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
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
  } catch (error: any) {
    console.error("Failed to update queue:", error)
    return fail("Failed to update queue. Please try again")
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
    const isAuthorized = await checkAdminOrOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    // Check for active tickets
    const activeTicketCount = await queueRepo.countActiveTickets(id)
    if (activeTicketCount > 0) {
      return fail("Cannot delete queue with active tickets in progress")
    }

    await queueRepo.deleteQueue(id)
    return ok(undefined)
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error("Failed to fetch queue details:", error)
    return fail("Failed to fetch queue details")
  }
}
