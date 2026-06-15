"use server"

import { auth } from "@/auth"
import { db } from "@/server/lib/db"
import { fail, ok } from "@/server/lib/action-utils"
import type { ActionResult } from "@/server/lib/action-utils"

/**
 * Soft-delete the current user's account.
 * Sets deletedAt and isActive=false. Does NOT hard-delete data.
 */
export async function deleteAccount(confirmEmail: string): Promise<ActionResult<{ message: string }>> {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return fail("You must be signed in.")
  }

  // Require email confirmation to prevent accidental deletion
  if (confirmEmail.trim().toLowerCase() !== session.user.email.toLowerCase()) {
    return fail("Email does not match. Please type your email to confirm.")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  })

  if (!user) {
    return fail("User not found.")
  }

  // Soft-delete the user
  await db.user.update({
    where: { id: user.id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  })

  return ok({ message: "Account deleted. You will be signed out." })
}
