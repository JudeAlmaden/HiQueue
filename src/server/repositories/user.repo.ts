import { db } from "@/server/lib/db"

/**
 * User repository — thin layer over Prisma for user-related DB queries.
 * No business logic here; just data access.
 */

export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
}

export async function createUser(data: {
  name: string
  email: string
  password: string
}) {
  return db.user.create({
    data,
  })
}
