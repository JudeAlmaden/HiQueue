import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { getOrgPortalBySlug } from "@/server/repositories/portal.repo"
import { getStaffCountersForOrg } from "@/server/repositories/assignment.repo"
import { Building2, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function StaffCounterPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id!

  const org = await getOrgPortalBySlug(slug)
  if (!org) notFound()

  const counters = await getStaffCountersForOrg(userId, org.id)
  const welcome =
    org.branding.welcomeMessage ??
    `Welcome, ${session?.user?.name || session?.user?.email || "Staff Member"}`
  const tagline =
    org.branding.tagline ??
    "Manage and monitor your counter assignments. Select a counter below to view and process tickets."

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          Staff Portal
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
          {welcome}
        </h1>
        <p className="text-sm text-on-surface-variant max-w-xl">{tagline}</p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant/80">
            Your Assigned Counters
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
            {counters.length} {counters.length === 1 ? "Assignment" : "Assignments"}
          </span>
        </div>

        {counters.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {counters.map((c) => (
              <div
                key={c.id}
                className="group rounded-2xl bg-card border border-border p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[12rem]"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                    {c.queue.name}
                  </span>
                  <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                    <Monitor className="h-5 w-5 shrink-0 opacity-80" />
                    {c.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant">Status: Active & ready for serving</p>
                </div>
                <Link
                  href={`/org/${slug}/counter/${c.id}`}
                  className="w-full h-10 rounded-full font-semibold text-xs bg-primary text-on-primary hover:opacity-95 shadow-sm mt-4 cursor-pointer flex items-center justify-center"
                >
                  Open Counter Console
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center bg-card max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-on-surface">No Assigned Counters</p>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                You aren&apos;t currently assigned to any counters in this workspace. Please
                contact your administrator.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
