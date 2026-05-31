"use server"

import { createServiceSchema, updateServiceSchema, deleteServiceSchema } from "@/server/validators/service.validator"
import * as serviceService from "@/server/services/service.service"
import { fail } from "@/server/lib/action-utils"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createServiceAction(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const orgSlug = formData.get("orgSlug") as string | null
  const organizationId = formData.get("organizationId") as string
  const queueId = formData.get("queueId") as string

  const avgDurationStr = formData.get("avgDurationMinutes") as string | null
  const avgDurationMinutes = avgDurationStr ? parseInt(avgDurationStr, 10) : undefined

  const result = createServiceSchema.safeParse({
    name: formData.get("name"),
    prefix: formData.get("prefix"),
    avgDurationMinutes: isNaN(avgDurationMinutes as any) ? undefined : avgDurationMinutes,
    queueId,
  })

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await serviceService.createService(result.data, userId, organizationId)

  if (res.success && orgSlug) {
    revalidatePath(`/dashboard/organizations/${orgSlug}/queues/${queueId}`)
  }

  return res
}

export async function updateServiceAction(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const orgSlug = formData.get("orgSlug") as string | null
  const organizationId = formData.get("organizationId") as string
  const queueId = formData.get("queueId") as string

  const avgDurationStr = formData.get("avgDurationMinutes") as string | null
  const avgDurationMinutes = avgDurationStr ? parseInt(avgDurationStr, 10) : undefined

  const result = updateServiceSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    prefix: formData.get("prefix") || undefined,
    avgDurationMinutes: isNaN(avgDurationMinutes as any) ? undefined : avgDurationMinutes,
  })

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await serviceService.updateService(result.data, userId, organizationId)

  if (res.success && orgSlug) {
    revalidatePath(`/dashboard/organizations/${orgSlug}/queues/${queueId}`)
  }

  return res
}

export async function deleteServiceAction(input: {
  id: string
  organizationId: string
  orgSlug: string
  queueId: string
}) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const result = deleteServiceSchema.safeParse({ id: input.id })

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await serviceService.deleteService(result.data.id, userId, input.organizationId)

  if (res.success && input.orgSlug) {
    revalidatePath(`/dashboard/organizations/${input.orgSlug}/queues/${input.queueId}`)
  }

  return res
}
