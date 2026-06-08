import { auth } from "@/auth"
import { getOrganizationBySlugWithDetails } from "@/server/services/organization.service"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  Calendar,
  Crown,
  ExternalLink,
  ListOrdered,
  Monitor,
  Plus,
  ShieldCheck,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import type { ElementType } from "react"

const ROLE_META: Record<string, { label: string; icon: ElementType; className: string }> = {
  owner: { label: "Owner", icon: Crown, className: "bg-primary/10 text-primary" },
  admin: { label: "Admin", icon: ShieldCheck, className: "bg-tertiary/10 text-tertiary" },
  staff: { label: "Staff", icon: User, className: "bg-secondary-container text-on-secondary-container" },
}

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect("/login")

  const res = await getOrganizationBySlugWithDetails(slug)
  if (!res.success) notFound()

  const org = res.data

  // Ensure the current user is actually a member
  const currentMembership = org.memberships.find((m) => m.user.id === userId)
  if (!currentMembership) {
    // User is not a member of this organization, redirect to their own dashboard
    redirect("/dashboard")
  }

  const memberCount = org.memberships.length
  const queueCount = org.queues.length
  const activeQueueCount = org.queues.filter((queue) => queue.isActive).length
  const counterCount = org.queues.reduce((total, queue) => total + queue.counters.length, 0)
  const createdLabel = new Date(org.createdAt).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const ownerMembership = org.memberships.find((membership) => membership.role === "owner")
  const visibleMembers = org.memberships.slice(0, 4)
  const readyQueues = org.queues.filter((queue) => queue.counters.length > 0).length


  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-primary/10 shadow-[0_18px_60px_rgba(74,101,78,0.08)]">
        <div className="grid gap-6 p-5 md:grid-cols-[1.35fr_0.65fr] md:p-6">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                <Activity className="h-3.5 w-3.5" />
                Workspace overview
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-on-surface-variant">
                <Calendar className="h-3.5 w-3.5" />
                Opened {createdLabel}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                Keep service moving at {org.name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
                Monitor the team, queues, and counter coverage from one calm workspace before opening the live portals.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Active queues", value: activeQueueCount, hint: `${queueCount} total`, icon: ListOrdered },
                { label: "Team members", value: memberCount, hint: ownerMembership?.user.name ?? ownerMembership?.user.email ?? "Owner assigned", icon: Users },
                { label: "Counters", value: counterCount, hint: `${readyQueues} queues ready`, icon: Monitor },
              ].map(({ label, value, hint, icon: Icon }) => (
                <div key={label} className="rounded-xl bg-surface-low p-4 ring-1 ring-primary/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-on-surface-variant">{label}</p>
                      <p className="mt-2 text-3xl font-bold tabular-nums text-on-surface">{value}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 truncate text-xs text-on-surface-variant">{hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-surface p-4 ring-1 ring-primary/10">
            <p className="text-sm font-semibold text-on-surface">Quick actions</p>
            <div className="mt-4 grid gap-2">
              <Link
                href={`/dashboard/organizations/${org.slug}/queues`}
                className="inline-flex items-center justify-between rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition hover:opacity-90"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Manage queues
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/dashboard/organizations/${org.slug}/members`}
                className="inline-flex items-center justify-between rounded-full bg-secondary-container px-4 py-2.5 text-sm font-semibold text-on-secondary-container transition hover:bg-secondary-container/80"
              >
                <span className="inline-flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Manage Staff
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/org/${org.slug}/login`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between rounded-full bg-surface-container px-4 py-2.5 text-sm font-semibold text-on-surface transition hover:bg-surface-high"
              >
                <span className="inline-flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Staff portal
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-on-surface">Queues</h2>
              <p className="text-sm text-on-surface-variant">Counters and access points for each queue.</p>
            </div>
            <Link
              href={`/dashboard/organizations/${org.slug}/queues`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {org.queues.length > 0 ? (
            <div className="space-y-3">
              {org.queues.map((queue) => (
                <Link
                  key={queue.id}
                  href={`/dashboard/organizations/${org.slug}/queues/${queue.id}`}
                  className="group flex items-center justify-between gap-4 rounded-xl bg-card p-4 ring-1 ring-primary/10 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(74,101,78,0.08)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                      <ListOrdered className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">{queue.name}</p>
                      <p className="truncate text-xs text-on-surface-variant">
                        {queue.description || "No description added"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-on-surface-variant sm:inline-flex">
                      {queue.counters.length} {queue.counters.length === 1 ? "counter" : "counters"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      queue.isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-container text-on-surface-variant"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${queue.isActive ? "bg-primary" : "bg-outline"}`} />
                      {queue.isActive ? "Active" : "Paused"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-on-surface-variant transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-outline-variant bg-surface-low px-5 py-10 text-center">
              <ListOrdered className="mx-auto h-8 w-8 text-on-surface-variant/50" />
              <p className="mt-3 text-sm font-semibold text-on-surface">No queues yet</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-on-surface-variant">
                Create a queue to start routing guests to counters and staff stations.
              </p>
              <Link
                href={`/dashboard/organizations/${org.slug}/queues`}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
              >
                <Plus className="h-4 w-4" />
                Create queue
              </Link>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-xl bg-card p-4 ring-1 ring-primary/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-on-surface">Team</h2>
                <p className="text-sm text-on-surface-variant">Current workspace access.</p>
              </div>
              <Link
                href={`/dashboard/organizations/${org.slug}/members`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition hover:bg-secondary-container hover:text-on-secondary-container"
                aria-label="Manage members"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {visibleMembers.map((membership) => {
                const meta = ROLE_META[membership.role] ?? ROLE_META.staff
                const RoleIcon = meta.icon
                const isYou = membership.user.id === userId
                return (
                  <div key={membership.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-low p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">
                        {(membership.user.name ?? membership.user.email ?? "?").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-on-surface">
                          {membership.user.name ?? membership.user.email}
                          {isYou && <span className="ml-1.5 text-xs font-medium text-on-surface-variant">(you)</span>}
                        </p>
                        {membership.user.name && (
                          <p className="truncate text-xs text-on-surface-variant">{membership.user.email}</p>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                      <RoleIcon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
