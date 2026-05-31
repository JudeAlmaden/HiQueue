import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import { signIn } from "@/server/lib/auth"
import { db } from "@/server/lib/db"
import { findUserByEmail, createUser } from "@/server/repositories/user.repo"
import { fail } from "@/server/lib/action-utils"
import {
  getStaffPortalLoginPath,
  isWorkspaceOwner,
} from "@/server/lib/account-access"
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
  const user = await findUserByEmail(data.email)

  if (!user?.password) {
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
    const membership = await db.organizationMembership.findUnique({
      where: { userId: user.id },
      include: { organization: { select: { slug: true } } },
    })

    if (!membership || membership.organization.slug !== orgSlug) {
      return fail("You do not have access to this workspace.")
    }
  } else if (!isWorkspaceOwner(user.createdById)) {
    const portalPath = await getStaffPortalLoginPath(user.id)
    return fail(
      portalPath
        ? `This is a staff account. Sign in at your organization portal: ${portalPath}`
        : "This is a staff account. Use your organization's staff portal to sign in."
    )
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
