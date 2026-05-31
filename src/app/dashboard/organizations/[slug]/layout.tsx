import { auth } from "@/auth"
import {
  getOrganizationBySlugWithDetails,
  getUserOrganization,
} from "@/server/services/organization.service"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Building2 } from "lucide-react"
import { WorkspaceNav } from "./WorkspaceNav"

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function OrgDashboardLayout({ children, params }: Props) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect("/login")

  const userOrgRes = await getUserOrganization(userId)
  if (!userOrgRes.success || !userOrgRes.data) {
    redirect("/onboarding")
  }

  if (userOrgRes.data.slug !== slug) {
    redirect(`/dashboard/organizations/${userOrgRes.data.slug}`)
  }

  const res = await getOrganizationBySlugWithDetails(slug)
  if (!res.success) notFound()

  const org = res.data

  // Verify the user is a member of the organization
  const currentMembership = org.memberships.find((m) => m.user.id === userId)
  if (!currentMembership) notFound()

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">
              {org.name}
            </h1>
            <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider mt-0.5">
              Workspace Slug: {org.slug}
            </p>
          </div>
        </div>

        {/* Action tags or buttons if any */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container">
            <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
            {currentMembership.role}
          </span>
          <Link
            href={`/org/${org.slug}/login`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-8 px-3 rounded-full text-xs font-semibold bg-primary text-on-primary hover:opacity-90 shadow-sm transition-all"
          >
            Preview staff portal
          </Link>
        </div>
      </div>

      {/* Horizontal Tab Navigation */}
      <WorkspaceNav slug={org.slug} />

      {/* Child views */}
      <div className="pt-2">
        {children}
      </div>
    </div>
  )
}
