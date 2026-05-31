import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { requireWorkspaceOwner } from "@/server/lib/account-access"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const access = await requireWorkspaceOwner(userId)
  if (!access.allowed) {
    redirect(access.staffPortalPath ?? "/login?error=staff")
  }

  return children
}
