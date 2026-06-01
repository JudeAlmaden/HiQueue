import * as assignmentRepo from "@/server/repositories/assignment.repo"
import { ok, fail, ActionResult } from "@/server/lib/action-utils"
import { AssignStaffInput, UnassignStaffInput } from "@/server/validators/assignment.validator"
import { db } from "@/server/lib/db"
import { hasOrganizationRole } from "@/server/lib/permissions"

async function checkAdminOrOwner(userId: string, organizationId: string): Promise<boolean> {
  return hasOrganizationRole(userId, organizationId, ["owner", "admin"])
}

/**
 * Assign a staff member to a counter.
 */
export async function assignStaff(
  input: AssignStaffInput,
  userId: string
): Promise<ActionResult<any>> {
  try {
    const counter = await db.counter.findUnique({
      where: { id: input.counterId },
      include: { queue: { select: { organizationId: true } } },
    })

    if (!counter || counter.queue.organizationId !== input.organizationId) {
      return fail("Counter not found or does not belong to your organization")
    }

    const isAuthorized = await checkAdminOrOwner(userId, input.organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    // Verify user to assign is member of the organization
    const membership = await assignmentRepo.verifyMembership(input.userId, input.organizationId)
    if (!membership) {
      return fail("Staff member is not a member of this organization")
    }

    const updated = await assignmentRepo.assignStaffToCounter(input.userId, input.counterId)
    return ok(updated)
  } catch (error: any) {
    console.error("Failed to assign staff:", error)
    return fail("Failed to assign staff. Please try again")
  }
}

/**
 * Unassign a staff member from a counter.
 */
export async function unassignStaff(
  input: UnassignStaffInput,
  userId: string
): Promise<ActionResult<any>> {
  try {
    const counter = await db.counter.findUnique({
      where: { id: input.counterId },
      include: { queue: true },
    })

    if (!counter) {
      return fail("Counter not found")
    }

    const organizationId = counter.queue.organizationId
    const isAuthorized = await checkAdminOrOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    const membership = await assignmentRepo.verifyMembership(input.userId, organizationId)
    if (!membership) {
      return fail("Staff member is not a member of this organization")
    }

    const updated = await assignmentRepo.unassignStaffFromCounter(input.userId, input.counterId)
    return ok(updated)
  } catch (error: any) {
    console.error("Failed to unassign staff:", error)
    return fail("Failed to unassign staff. Please try again")
  }
}
