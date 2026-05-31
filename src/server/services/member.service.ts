import * as memberRepo from "@/server/repositories/member.repo"
import { ok, fail, ActionResult } from "@/server/lib/action-utils"
import { CreateMemberInput, UpdateMemberInput, DeleteMemberInput } from "@/server/validators/member.validator"
import { db } from "@/server/lib/db"

/**
 * Member service — handles business logic for member management.
 * Validates permissions and enforces business rules before calling repository.
 */

/**
 * Create a new member in an organization.
 * Validates that the user has owner or admin role.
 * Checks for duplicate email in the organization.
 * @param input - Member creation data
 * @param userId - ID of the user creating the member
 * @returns ActionResult with created user or error message
 */
export async function createMember(
  input: CreateMemberInput,
  userId: string
): Promise<ActionResult<{ id: string; name: string; email: string | null }>> {
  try {
    // Verify the user has owner or admin role
    const membership = await db.organizationMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId: input.organizationId } },
    })

    if (!membership) {
      return fail("You are not a member of this organization")
    }

    if (membership.role !== "owner" && membership.role !== "admin") {
      return fail("You don't have permission to perform this action")
    }

    // Check for duplicate email in organization
    const existingMember = await memberRepo.findMemberByEmail(input.email, input.organizationId)
    if (existingMember) {
      return fail("A member with this email already exists in the organization")
    }

    const existingUser = await memberRepo.findUserWithMembershipByEmail(input.email)
    if (existingUser?.memberships.length) {
      return fail("This user already belongs to an organization")
    }

    // Create the member
    const user = await memberRepo.createMember(
      {
        name: input.name,
        email: input.email,
        password: input.password,
      },
      input.organizationId,
      input.role,
      userId
    )

    return ok({ id: user.id, name: user.name || "", email: user.email })
  } catch (error: any) {
    console.error("Failed to create member:", error)
    return fail("Failed to create member. Please try again")
  }
}

/**
 * Update a member's information.
 * Validates that the user has owner or admin role.
 * Can update user data (name, email) and/or role.
 * @param input - Member update data
 * @param userId - ID of the user performing the update
 * @param organizationId - Organization ID for permission check
 * @returns ActionResult with success or error message
 */
export async function updateMember(
  input: UpdateMemberInput,
  userId: string,
  organizationId: string
): Promise<ActionResult<void>> {
  try {
    // Verify the user has owner or admin role
    const membership = await db.organizationMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    })

    if (!membership) {
      return fail("You are not a member of this organization")
    }

    if (membership.role !== "owner" && membership.role !== "admin") {
      return fail("You don't have permission to perform this action")
    }

    // Check if email is being updated and if it's a duplicate
    if (input.email) {
      const existingMember = await memberRepo.findMemberByEmail(input.email, organizationId)
      if (existingMember && existingMember.id !== input.id) {
        return fail("A member with this email already exists in the organization")
      }
    }

    // Update user data if name or email is provided
    if (input.name !== undefined || input.email !== undefined) {
      await memberRepo.updateMemberUser(input.id, {
        name: input.name,
        email: input.email,
      })
    }

    // Update role if provided
    if (input.role !== undefined) {
      await memberRepo.updateMemberRole(input.id, organizationId, input.role)
    }

    return ok(undefined)
  } catch (error: any) {
    console.error("Failed to update member:", error)
    return fail("Failed to update member. Please try again")
  }
}

/**
 * Delete a member from an organization.
 * Validates that the user has owner or admin role.
 * Prevents admins from removing owners.
 * @param input - Member deletion data
 * @param userId - ID of the user performing the deletion
 * @returns ActionResult with success or error message
 */
export async function deleteMember(
  input: DeleteMemberInput,
  userId: string
): Promise<ActionResult<void>> {
  try {
    // Verify the user has owner or admin role
    const membership = await db.organizationMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId: input.organizationId } },
    })

    if (!membership) {
      return fail("You are not a member of this organization")
    }

    if (membership.role !== "owner" && membership.role !== "admin") {
      return fail("You don't have permission to perform this action")
    }

    // Get the target member's role
    const targetMembership = await db.organizationMembership.findUnique({
      where: { userId_organizationId: { userId: input.id, organizationId: input.organizationId } },
    })

    if (!targetMembership) {
      return fail("Member not found in this organization")
    }

    // Prevent admins from removing owners
    if (membership.role === "admin" && targetMembership.role === "owner") {
      return fail("Admins cannot remove organization owners")
    }

    // Delete the member
    await memberRepo.deleteMember(input.id, input.organizationId)

    return ok(undefined)
  } catch (error: any) {
    console.error("Failed to delete member:", error)
    return fail("Failed to delete member. Please try again")
  }
}

/**
 * Get all members of an organization.
 * @param organizationId - Organization ID
 * @returns ActionResult with array of members or error message
 */
export async function getOrganizationMembers(organizationId: string) {
  try {
    const members = await memberRepo.getOrganizationMembers(organizationId)
    return ok(members)
  } catch (error: any) {
    console.error("Failed to fetch organization members:", error)
    return fail("Failed to fetch organization members")
  }
}
