import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOrgPortalBySlug, verifyOrgMembership } from "@/server/repositories/portal.repo"
import OrgLoginClient from "./OrgLoginClient"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function OrgLoginPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { error: errorParam } = await searchParams

  const org = await getOrgPortalBySlug(slug)
  if (!org) {
    redirect("/")
  }

  const session = await auth()
  let alreadySignedIn = false
  let signedInEmail: string | null = null

  if (session?.user?.id) {
    const membership = await verifyOrgMembership(session.user.id, org.id)
    if (membership) {
      alreadySignedIn = true
      signedInEmail = session.user.email ?? null
    }
  }

  const initialError =
    errorParam === "AccessDenied"
      ? "You do not have access to this workspace. Sign in with a staff account for this organization."
      : null

  return (
    <OrgLoginClient
      org={org}
      initialError={initialError}
      alreadySignedIn={alreadySignedIn}
      signedInEmail={signedInEmail}
    />
  )
}
