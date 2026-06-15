"use server"

import { auth } from "@/auth"
import { db } from "@/server/lib/db"
import { fail, ok } from "@/server/lib/action-utils"
import type { ActionResult } from "@/server/lib/action-utils"

export interface LinkedAccount {
  id: string
  provider: string
  providerAccountId: string
  createdAt: Date
}

export async function getLinkedAccounts(): Promise<ActionResult<LinkedAccount[]>> {
  const session = await auth()
  if (!session?.user?.id) {
    return fail("You must be signed in.")
  }

  const accounts = await db.account.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      provider: true,
      providerAccountId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  })

  return ok(accounts)
}

export async function unlinkAccount(accountId: string): Promise<ActionResult<{ message: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return fail("You must be signed in.")
  }

  // Verify the account belongs to this user
  const account = await db.account.findFirst({
    where: { id: accountId, userId: session.user.id },
  })

  if (!account) {
    return fail("Account not found.")
  }

  // Check if user has a password set — if not, they can't unlink their only sign-in method
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  const accountCount = await db.account.count({
    where: { userId: session.user.id },
  })

  if (!user?.password && accountCount <= 1) {
    return fail("Cannot unlink your only sign-in method. Set a password first in Security settings.")
  }

  await db.account.delete({ where: { id: accountId } })

  return ok({ message: `${account.provider} account unlinked successfully.` })
}
