import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Building2,
  Clock,
  ListOrdered,
  Ticket,
  Timer,
  Users,
} from "lucide-react"
import { auth } from "@/auth"
import { StatCard } from "@/components/dashboard/StatCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getWorkspaceAnalytics } from "@/server/services/analytics.service"
import { redirect } from "next/navigation"

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "0m"
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 1000 ? "compact" : "standard" }).format(value)
}

const STATUS_LABELS: Record<string, string> = {
  waiting: "Waiting",
  serving: "Serving",
  hold: "On hold",
  done: "Done",
  skipped: "Skipped",
  no_show: "No show",
}

export default async function DashboardOverviewPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect("/login")

  const analytics = await getWorkspaceAnalytics(userId, "today")

  if (!analytics) redirect("/onboarding")

  const orgPath = `/dashboard/organizations/${analytics.organization.slug}`
  const topQueues = analytics.queueStats
    .filter((queue) => queue.ticketCount > 0 || queue.active)
    .slice(0, 4)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back{session.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live workspace activity for{" "}
            <span className="font-medium text-foreground">{analytics.organization.name}</span> today.
          </p>
        </div>
        <Link
          href="/dashboard/analytics"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:opacity-90"
        >
          <BarChart3 className="h-4 w-4" />
          Open analytics
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tickets today" value={formatCount(analytics.metrics.ticketsToday)} icon={Ticket} />
        <StatCard
          label="Active queues"
          value={analytics.metrics.activeQueues}
          icon={ListOrdered}
          hint={`${analytics.metrics.totalQueues} total`}
        />
        <StatCard
          label="Avg wait"
          value={formatMinutes(analytics.metrics.avgWaitMinutes)}
          icon={Clock}
          hint="Called tickets"
        />
        <StatCard
          label="Avg handling"
          value={formatMinutes(analytics.metrics.avgHandleMinutes)}
          icon={Timer}
          hint="Completed tickets"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump into your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Manage queues", href: `${orgPath}/queues`, icon: ListOrdered },
              { label: "View members", href: `${orgPath}/members`, icon: Users },
              { label: "Staff assignments", href: `${orgPath}/assignments`, icon: Building2 },
              { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent tickets</CardTitle>
            <CardDescription>Latest activity across all queues today</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.recentTickets.length > 0 ? (
              <ul className="divide-y divide-border -mx-4 px-4">
                {analytics.recentTickets.slice(0, 5).map((ticket) => (
                  <li key={ticket.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {ticket.code} / {ticket.queue}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {ticket.service} / {ticket.counter}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground shrink-0">
                      {STATUS_LABELS[ticket.status] ?? ticket.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-border py-8 text-center">
                <Ticket className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium text-foreground">No tickets today</p>
                <p className="text-xs text-muted-foreground mt-1">New queue activity will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue pulse</CardTitle>
          <CardDescription>Today&apos;s queue volume and wait time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topQueues.length > 0 ? (
            topQueues.map((queue) => (
              <Link
                key={queue.id}
                href={`${orgPath}/queues/${queue.id}`}
                className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 px-4 py-3 transition hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{queue.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {queue.ticketCount} tickets / {queue.counterCount} counters
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-foreground">{formatMinutes(queue.avgWaitMinutes)}</p>
                  <p className="text-xs text-muted-foreground">avg wait</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Queue activity will appear once tickets are created.
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Signed in as <span className="capitalize">owner</span> /{" "}
        <Link href={orgPath} className="text-primary hover:underline">
          Workspace overview
        </Link>
      </p>
    </div>
  )
}
