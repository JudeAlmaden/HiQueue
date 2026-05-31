"use server"

import { registerSchema, loginSchema } from "@/server/validators/auth"
import * as authService from "@/server/services/auth.service"
import { fail } from "@/server/lib/action-utils"

export async function registerUser(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const result = registerSchema.safeParse(raw)

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  return authService.registerUser(result.data)
}

export async function loginUser(formData: FormData) {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const result = loginSchema.safeParse(raw)

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const orgSlug = formData.get("orgSlug") as string | null

  return authService.loginUser(result.data, { orgSlug })
}
