"use server"

import { createMemberSchema, updateMemberSchema, deleteMemberSchema } from "@/server/validators/member.validator"
import * as memberService from "@/server/services/member.service"
import { fail } from "@/server/lib/action-utils"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createMemberAction(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const orgSlug = formData.get("orgSlug") as string | null

  const result = createMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    organizationId: formData.get("organizationId"),
  })

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await memberService.createMember(result.data, userId)

  if (res.success && orgSlug) {
    revalidatePath(`/dashboard/organizations/${orgSlug}`)
    revalidatePath(`/dashboard/organizations/${orgSlug}/members`)
  }

  return res
}

export async function updateMemberAction(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const orgSlug = formData.get("orgSlug") as string | null
  const organizationId = formData.get("organizationId") as string

  const result = updateMemberSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    email: formData.get("email") || undefined,
    role: formData.get("role") || undefined,
  })

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await memberService.updateMember(result.data, userId, organizationId)

  if (res.success && orgSlug) {
    revalidatePath(`/dashboard/organizations/${orgSlug}`)
    revalidatePath(`/dashboard/organizations/${orgSlug}/members`)
  }

  return res
}

export async function deleteMemberAction(input: { id: string; organizationId: string; orgSlug?: string }) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const result = deleteMemberSchema.safeParse(input)

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const res = await memberService.deleteMember(result.data, userId)

  if (res.success && input.orgSlug) {
    revalidatePath(`/dashboard/organizations/${input.orgSlug}`)
    revalidatePath(`/dashboard/organizations/${input.orgSlug}/members`)
  }

  return res
}
