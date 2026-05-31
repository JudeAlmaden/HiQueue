"use server"

import { createQueueSchema, updateQueueSchema, deleteQueueSchema } from "@/server/validators/queue.validator"
import * as queueService from "@/server/services/queue.service"
import { fail } from "@/server/lib/action-utils"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createQueueAction(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const orgSlug = formData.get("orgSlug") as string | null

  const result = createQueueSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    passcode: formData.get("passcode") || undefined,
    organizationId: formData.get("organizationId"),
  })

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await queueService.createQueue(result.data, userId)

  if (res.success && orgSlug) {
    revalidatePath(`/dashboard/organizations/${orgSlug}`)
    revalidatePath(`/dashboard/organizations/${orgSlug}/queues`)
  }

  return res
}

export async function updateQueueAction(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const orgSlug = formData.get("orgSlug") as string | null
  const organizationId = formData.get("organizationId") as string

  // Gather layout and theme if sent as stringified JSON
  const themeStr = formData.get("theme") as string | null
  const layoutStr = formData.get("layout") as string | null
  let theme = undefined
  let layout = undefined

  try {
    if (themeStr) theme = JSON.parse(themeStr)
    if (layoutStr) layout = JSON.parse(layoutStr)
  } catch (e) {
    return fail("Invalid layout or theme format")
  }

  const result = updateQueueSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    passcode: formData.get("passcode") || undefined,
    theme,
    layout,
  })

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await queueService.updateQueue(result.data, userId, organizationId)

  if (res.success && orgSlug) {
    revalidatePath(`/dashboard/organizations/${orgSlug}`)
    revalidatePath(`/dashboard/organizations/${orgSlug}/queues`)
    revalidatePath(`/dashboard/organizations/${orgSlug}/queues/${result.data.id}`)
  }

  return res
}

export async function deleteQueueAction(input: { id: string; organizationId: string; orgSlug?: string }) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const result = deleteQueueSchema.safeParse({ id: input.id })

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await queueService.deleteQueue(result.data.id, userId, input.organizationId)

  if (res.success && input.orgSlug) {
    revalidatePath(`/dashboard/organizations/${input.orgSlug}`)
    revalidatePath(`/dashboard/organizations/${input.orgSlug}/queues`)
  }

  return res
}
