import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import { signIn } from "@/server/lib/auth"
import { db } from "@/server/lib/db"
import type { Prisma } from "@prisma/client"
import { findUserByEmail, createUser } from "@/server/repositories/user.repo"
import { fail } from "@/server/lib/action-utils"
import type { LoginInput, RegisterInput } from "@/server/validators/auth"

export async function registerUser(data: RegisterInput) {
  const existingUser = await findUserByEmail(data.email)

  if (existingUser) {
    return fail("User already exists with that email.")
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  await createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  })

  redirect("/login")
}

export async function loginUser(
  data: LoginInput,
  options?: { orgSlug?: string | null }
) {
  const orgSlug = options?.orgSlug?.trim() || null
  const email = data.email.trim().toLowerCase()

  // Try to find owner
  const owner = await findUserByEmail(email)

  // Try to find staff
  let staff: (Prisma.StaffUserGetPayload<{ include: { organization: true } }>) | null = null
  if (!owner) {
    staff = await db.staffUser.findFirst({
      where: { email },
      include: { organization: true },
    })
  }

  const user = owner || staff

  if (!user || !user.password) {
    return fail(
      orgSlug
        ? "Invalid email or password for this workspace."
        : "Invalid email or password."
    )
  }

  const passwordsMatch = await bcrypt.compare(data.password, user.password)
  if (!passwordsMatch) {
    return fail(
      orgSlug
        ? "Invalid email or password for this workspace."
        : "Invalid email or password."
    )
  }

  if (orgSlug) {
    // Portal login intent
    if (owner) {
      // Owner logging into portal
      const userWithOrg = await db.user.findFirst({
        where: { id: owner.id },
        include: { organization: { select: { slug: true } } },
      })
      if (!userWithOrg || !userWithOrg.organization || userWithOrg.organization.slug !== orgSlug) {
        return fail("You do not have access to this workspace.")
      }
    } else {
      // Staff logging into portal
      if (!staff || staff.organization.slug !== orgSlug) {
        return fail("You do not have access to this workspace.")
      }
    }
  } else {
    // Dashboard login intent
    if (!owner) {
      // Staff trying to login to dashboard
      if (!staff) {
        return fail("Invalid email or password.")
      }
      const portalPath = `/org/${staff.organization.slug}/login`
      return fail(
        `This is a staff account. Sign in at your organization portal: ${portalPath}`
      )
    }
  }

  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      orgSlug: orgSlug ?? "",
      loginIntent: orgSlug ? "portal" : "dashboard",
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return fail("Unable to complete sign in. Please try again.")
    }
    throw error
  }

  if (orgSlug) {
    redirect(`/org/${orgSlug}/counter`)
  }

  redirect("/dashboard")
}
