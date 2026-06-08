import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { getOrgPortalBySlug, verifyOrgMembership } from "@/server/repositories/portal.repo"
import { getStaffCountersForOrg } from "@/server/repositories/assignment.repo"
import { Building2, Crown, Monitor, Settings2, ShieldCheck, UserRound } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function StaffCounterPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) notFound()

  const org = await getOrgPortalBySlug(slug)
  if (!org) notFound()

  const membership = await verifyOrgMembership(userId, org.id)
  if (!membership) notFound()

  const counters = await getStaffCountersForOrg(userId, org.id)
  const role = membership.role
  const isManager = role === "owner" || role === "admin"

  const RoleIcon = role === "owner" ? Crown : role === "admin" ? ShieldCheck : UserRound
  const rolePurpose =
    role === "owner"
      ? "Owns the workspace, manages billing-level decisions, roles, queues, services, counters, and day-to-day operations."
      : role === "admin"
        ? "Runs operations: manages queues, services, counters, assignments, and staff access."
        : "Serves customers from assigned counters and handles tickets during active queue sessions."
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

      <section>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <RoleIcon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
                {role} access
              </p>
              <h2 className="text-base font-bold text-on-surface">Your purpose in this workspace</h2>
              <p className="max-w-2xl text-sm text-on-surface-variant">{rolePurpose}</p>
            </div>
          </div>
        </div>
      </section>

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
                className={`group rounded-2xl border p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[12rem] ${
                  c.queue.isActive ? "bg-card border-border" : "bg-error/5 border-error/20"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                      {c.queue.name}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      c.queue.isActive ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
                    }`}>
                      {c.queue.isActive ? "Queue Open" : "Queue Closed"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                    <Monitor className="h-5 w-5 shrink-0 opacity-80" />
                    {c.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {c.queue.isActive
                      ? "Accepting new tickets while you process assigned services."
                      : "Closed to new tickets. You can still finish existing tickets."}
                  </p>
<div className="pt-1 text-xs">
  <span className="font-semibold text-muted-foreground">
    Services:
  </span>{" "}
  {c.services.length > 0 ? (
    c.services.map((service, index) => (
      <span
        key={service.id}
        className={
          service.isActive
            ? "text-foreground"
            : "line-through opacity-60"
        }
      >
        {service.name}
        {index < c.services.length - 1 && ", "}
      </span>
    ))
  ) : (
    <span className="italic text-muted-foreground">None</span>
  )}
</div>
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
              {isManager ? <Settings2 className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-on-surface">
                {isManager ? "No Counter Assignment Yet" : "No Assigned Counters"}
              </p>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                {isManager
                  ? "Managers can configure queues and assign themselves or staff to counters using the control buttons above."
                  : "You aren&apos;t currently assigned to any counters in this workspace. Please contact your administrator."}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
