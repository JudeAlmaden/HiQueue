"use server"

import { createOrganizationSchema, updateOrganizationSchema, deleteOrganizationSchema } from "@/server/validators/organization"
import * as orgService from "@/server/services/organization.service"
import { fail } from "@/server/lib/action-utils"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createOrganizationAction(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const result = createOrganizationSchema.safeParse({ name: formData.get("name") })
  if (!result.success) return fail(result.error.issues[0].message)

  const existing = await orgService.getUserOrganization(userId)
  if (existing.success && existing.data) {
    return fail("You already belong to an organization")
  }

  const res = await orgService.createOrganization(result.data, userId)

  if (res.success) {
    revalidatePath("/dashboard")
    redirect(`/dashboard/organizations/${res.data.slug}`)
  }

  return res
}

export async function updateOrganizationAction(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const result = updateOrganizationSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  })
  if (!result.success) return fail(result.error.issues[0].message)

  const res = await orgService.updateOrganization(result.data, userId)

  if (res.success) {
    revalidatePath("/dashboard/organizations")
    revalidatePath("/dashboard")
    redirect(`/dashboard/organizations/${res.data.slug}`)
  }

  return res
}

export async function deleteOrganizationAction(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return fail("Unauthorized")

  const result = deleteOrganizationSchema.safeParse({ id: formData.get("id") })
  if (!result.success) return fail(result.error.issues[0].message)

  const res = await orgService.deleteOrganization(result.data.id, userId)

  if (res.success) {
    revalidatePath("/dashboard/organizations")
    revalidatePath("/dashboard")
    redirect("/onboarding")
  }

  return res
}
