import * as serviceRepo from "@/server/repositories/service.repo"
import { ok, fail, ActionResult } from "@/server/lib/action-utils"
import { CreateServiceInput, UpdateServiceInput } from "@/server/validators/service.validator"
import { db } from "@/server/lib/db"
import {
  canSetServiceActive,
  getOrganizationRole,
  hasOrganizationRole,
} from "@/server/lib/permissions"

async function checkOwner(userId: string, organizationId: string): Promise<boolean> {
  return hasOrganizationRole(userId, organizationId, ["owner"])
}

/**
 * Create a new service under a queue.
 */
export async function createService(
  input: CreateServiceInput,
  userId: string,
  organizationId: string
): Promise<ActionResult<any>> {
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

    // Check duplicate name in same queue
    const duplicateName = await serviceRepo.findServiceByName(input.name, input.queueId)
    if (duplicateName) {
      return fail("A service with this name already exists in the queue")
    }

    // Check duplicate prefix in same queue
    const duplicatePrefix = await serviceRepo.findServiceByPrefix(input.prefix.toUpperCase(), input.queueId)
    if (duplicatePrefix) {
      return fail("A service with this prefix already exists in the queue")
    }

    const service = await serviceRepo.createService({
      name: input.name,
      prefix: input.prefix.toUpperCase(),
      avgDurationMinutes: input.avgDurationMinutes ?? undefined,
      queueId: input.queueId,
    })

    return ok(service)
  } catch (error: any) {
    console.error("Failed to create service:", error)
    return fail("Failed to create service. Please try again")
  }
}

/**
 * Update an existing service.
 */
export async function updateService(
  input: UpdateServiceInput,
  userId: string,
  organizationId: string
): Promise<ActionResult<any>> {
  try {
    const isAuthorized = await checkOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    const service = await db.service.findUnique({
      where: { id: input.id },
      include: { queue: true },
    })

    if (!service || service.queue.organizationId !== organizationId) {
      return fail("Service not found or does not belong to your organization")
    }

    // Check duplicate name in same queue
    if (input.name) {
      const duplicateName = await serviceRepo.findServiceByName(input.name, service.queueId)
      if (duplicateName && duplicateName.id !== service.id) {
        return fail("A service with this name already exists in the queue")
      }
    }

    // Check duplicate prefix in same queue
    if (input.prefix) {
      const duplicatePrefix = await serviceRepo.findServiceByPrefix(input.prefix.toUpperCase(), service.queueId)
      if (duplicatePrefix && duplicatePrefix.id !== service.id) {
        return fail("A service with this prefix already exists in the queue")
      }
    }

    const updated = await serviceRepo.updateService(input.id, {
      name: input.name,
      prefix: input.prefix ? input.prefix.toUpperCase() : undefined,
      avgDurationMinutes: input.avgDurationMinutes,
    })

    return ok(updated)
  } catch (error: any) {
    console.error("Failed to update service:", error)
    return fail("Failed to update service. Please try again")
  }
}

/**
 * Open or close a service for new tickets.
 */
export async function setServiceActive(
  id: string,
  isActive: boolean,
  userId: string,
  organizationId: string
): Promise<ActionResult<any>> {
  try {
    const role = await getOrganizationRole(userId, organizationId)
    const isAuthorized = canSetServiceActive(role, isActive)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    const service = await db.service.findUnique({
      where: { id },
      include: { queue: true },
    })

    if (!service || service.queue.organizationId !== organizationId) {
      return fail("Service not found or does not belong to your organization")
    }

    const updated = await serviceRepo.updateService(id, { isActive })
    return ok(updated)
  } catch (error: any) {
    console.error("Failed to update service status:", error)
    return fail("Failed to update service status. Please try again")
  }
}

/**
 * Delete a service.
 */
export async function deleteService(
  id: string,
  userId: string,
  organizationId: string
): Promise<ActionResult<void>> {
  try {
    const isAuthorized = await checkOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    const service = await db.service.findUnique({
      where: { id },
      include: { queue: true },
    })

    if (!service || service.queue.organizationId !== organizationId) {
      return fail("Service not found or does not belong to your organization")
    }

    // Check active tickets for service
    const activeTicketCount = await serviceRepo.countActiveTicketsForService(id)
    if (activeTicketCount > 0) {
      return fail("Cannot delete service with active tickets in progress")
    }

    await serviceRepo.deleteService(id)
    return ok(undefined)
  } catch (error: any) {
    console.error("Failed to delete service:", error)
    return fail("Failed to delete service. Please try again")
  }
}
