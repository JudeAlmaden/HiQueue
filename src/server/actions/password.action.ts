"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { db } from "@/server/lib/db"
import { hashPassword, verifyPassword } from "@/server/lib/password"
import { validatePasswordStrength, isCommonPassword } from "@/server/lib/sanitize"
import { fail, ok } from "@/server/lib/action-utils"
import type { ActionResult } from "@/server/lib/action-utils"

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters.").max(100, "Password is too long."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
})

export async function changePassword(formData: FormData): Promise<ActionResult<{ message: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return fail("You must be signed in to change your password.")
  }

  const raw = {
    currentPassword: formData.get("currentPassword") as string || undefined,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const result = changePasswordSchema.safeParse(raw)
  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  const { currentPassword, newPassword } = result.data

  // Validate password strength
  const strength = validatePasswordStrength(newPassword)
  if (!strength.isValid) {
    return fail(strength.errors[0])
  }

  if (isCommonPassword(newPassword)) {
    return fail("This password is too common. Please choose a stronger password.")
  }

  // Fetch user with current password
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  })

  if (!user) {
    return fail("User not found.")
  }

  const hasExistingPassword = !!user.password

  // If user has an existing password, verify it
  if (hasExistingPassword) {
    if (!currentPassword) {
      return fail("Current password is required.")
    }
    const isValid = await verifyPassword(currentPassword, user.password as string)
    if (!isValid) {
      return fail("Current password is incorrect.")
    }
  }

  // Hash and save new password
  const hashed = await hashPassword(newPassword)
  await db.user.update({
    where: { id: user.id },
    data: { password: hashed },
  })

  return ok({ message: hasExistingPassword ? "Password updated successfully." : "Password set successfully. You can now sign in with email and password." })
}

/**
 * Check whether the current user has a password set (for UI rendering).
 */
export async function getUserPasswordStatus(): Promise<ActionResult<{ hasPassword: boolean }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return fail("You must be signed in.")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user) {
    return fail("User not found.")
  }

  return ok({ hasPassword: !!user.password })
}
