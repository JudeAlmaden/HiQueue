"use server"

import { assignStaffSchema, unassignStaffSchema } from "@/server/validators/assignment.validator"
import * as assignmentService from "@/server/services/assignment.service"
import { fail } from "@/server/lib/action-utils"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function assignStaffAction(input: {
  userId: string
  counterId: string
  organizationId: string
  orgSlug: string
}) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const result = assignStaffSchema.safeParse(input)

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await assignmentService.assignStaff(result.data, userId)

  if (res.success && input.orgSlug) {
    revalidatePath(`/dashboard/organizations/${input.orgSlug}/assignments`)
    revalidatePath(`/dashboard/organizations/${input.orgSlug}/queues`)
  }

  return res
}

export async function unassignStaffAction(input: {
  userId: string
  counterId: string
  orgSlug: string
}) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const result = unassignStaffSchema.safeParse(input)

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await assignmentService.unassignStaff(result.data, userId)

  if (res.success && input.orgSlug) {
    revalidatePath(`/dashboard/organizations/${input.orgSlug}/assignments`)
    revalidatePath(`/dashboard/organizations/${input.orgSlug}/queues`)
  }

  return res
}
