import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOrgPortalBySlug, verifyOrgMembership } from "@/server/repositories/portal.repo"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OrgPortalIndexPage({ params }: Props) {
  const { slug } = await params
  const org = await getOrgPortalBySlug(slug)

  if (!org) {
    redirect("/")
  }

  const session = await auth()
  if (session?.user?.id) {
    const membership = await verifyOrgMembership(session.user.id, org.id)
    if (membership) {
      redirect(`/org/${slug}/counter`)
    }
  }

  redirect(`/org/${slug}/login`)
}
