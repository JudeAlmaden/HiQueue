import { auth } from "@/auth"
import { getOrganizationBySlugWithDetails } from "@/server/services/organization.service"
import { notFound, redirect } from "next/navigation"
import { Building2, Users, ListOrdered, Calendar, Crown, ShieldCheck, User } from "lucide-react"

const ROLE_META: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  owner:  { label: "Owner",  icon: Crown,        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  admin:  { label: "Admin",  icon: ShieldCheck,  className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  staff:  { label: "Staff",  icon: User,         className: "bg-secondary text-secondary-foreground" },
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
  if (!currentMembership) notFound()

  const memberCount = org.memberships.length
  const queueCount = org.queues.length

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{org.name}</h1>
          <p className="text-sm text-muted-foreground font-mono">{org.slug}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Members",  value: memberCount, icon: Users },
          { label: "Queues",   value: queueCount,  icon: ListOrdered },
          { label: "Created",  value: new Date(org.createdAt).toLocaleDateString(), icon: Calendar },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Members */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Members</h2>
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 divide-y divide-border overflow-hidden">
          {org.memberships.map((m) => {
            const meta = ROLE_META[m.role] ?? ROLE_META.staff
            const RoleIcon = meta.icon
            const isYou = m.user.id === userId
            return (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                    {(m.user.name ?? m.user.email ?? "?").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {m.user.name ?? m.user.email}
                      {isYou && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                    </p>
                    {m.user.name && (
                      <p className="text-xs text-muted-foreground truncate">{m.user.email}</p>
                    )}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${meta.className}`}>
                  <RoleIcon className="h-3 w-3" />
                  {meta.label}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Queues */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Queues</h2>
        {org.queues.length > 0 ? (
          <div className="rounded-xl bg-card ring-1 ring-foreground/10 divide-y divide-border overflow-hidden">
            {org.queues.map((q) => (
              <div key={q.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-secondary-foreground">
                    <ListOrdered className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{q.name}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {q.counters.length} {q.counters.length === 1 ? "counter" : "counters"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-10 text-center">
            <ListOrdered className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No queues yet</p>
          </div>
        )}
      </section>

    </div>
  )
}
