"use server"

import { createCounterSchema, updateCounterSchema, deleteCounterSchema } from "@/server/validators/counter.validator"
import * as counterService from "@/server/services/counter.service"
import { fail } from "@/server/lib/action-utils"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createCounterAction(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const orgSlug = formData.get("orgSlug") as string | null
  const organizationId = formData.get("organizationId") as string
  const queueId = formData.get("queueId") as string
  const serviceIds = formData.getAll("serviceIds") as string[]

  const result = createCounterSchema.safeParse({
    name: formData.get("name"),
    queueId,
    serviceIds,
  })

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await counterService.createCounter(result.data, userId, organizationId)

  if (res.success && orgSlug) {
    revalidatePath(`/dashboard/organizations/${orgSlug}/queues/${queueId}`)
  }

  return res
}

export async function updateCounterAction(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const orgSlug = formData.get("orgSlug") as string | null
  const organizationId = formData.get("organizationId") as string
  const queueId = formData.get("queueId") as string
  const serviceIds = formData.getAll("serviceIds") as string[]

  const result = updateCounterSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    serviceIds,
  })

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await counterService.updateCounter(result.data, userId, organizationId)

  if (res.success && orgSlug) {
    revalidatePath(`/dashboard/organizations/${orgSlug}/queues/${queueId}`)
  }

  return res
}

export async function deleteCounterAction(input: {
  id: string
  organizationId: string
  orgSlug: string
  queueId: string
}) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const result = deleteCounterSchema.safeParse({ id: input.id })

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await counterService.deleteCounter(result.data.id, userId, input.organizationId)

  if (res.success && input.orgSlug) {
    revalidatePath(`/dashboard/organizations/${input.orgSlug}/queues/${input.queueId}`)
  }

  return res
}
