import Link from "next/link"
import { redirect } from "next/navigation"
import { BarChart3, Clock, ListOrdered, Ticket, Timer, Users } from "lucide-react"
import { auth } from "@/auth"
import { StatCard } from "@/components/dashboard/StatCard"
import { StatusBreakdown } from "@/components/dashboard/StatusBreakdown"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ANALYTICS_RANGES,
  getWorkspaceAnalytics,
  parseAnalyticsRange,
} from "@/server/services/analytics.service"

interface AnalyticsPageProps {
  searchParams: Promise<{ range?: string | string[] }>
}

const STATUS_LABELS: Record<string, string> = {
  waiting: "Waiting",
  serving: "Serving",
  hold: "On hold",
  done: "Done",
  skipped: "Skipped",
  no_show: "No show",
}

function formatMinutes(minutes: number | null) {
  if (!minutes || minutes <= 0) return "0m"
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 1000 ? "compact" : "standard" }).format(value)
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) redirect("/login")

  const params = await searchParams
  const range = parseAnalyticsRange(params.range)
  const analytics = await getWorkspaceAnalytics(userId, range)

  if (!analytics) redirect("/onboarding")

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Queue performance and staff throughput for{" "}
            <span className="font-medium text-foreground">{analytics.organization.name}</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl bg-surface-low p-1 ring-1 ring-border/60">
          {ANALYTICS_RANGES.map((item) => (
            <Link
              key={item.key}
              href={`/dashboard/analytics?range=${item.key}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                item.key === analytics.range
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Tickets in range"
          value={formatCount(analytics.metrics.ticketsInRange)}
          icon={Ticket}
          hint={`${formatCount(analytics.metrics.ticketsToday)} today`}
        />
        <StatCard
          label="Completion rate"
          value={`${analytics.metrics.completionRate}%`}
          icon={BarChart3}
          hint={`${formatCount(analytics.metrics.completedTickets)} completed`}
        />
        <StatCard
          label="Avg queue time"
          value={formatMinutes(analytics.metrics.avgWaitMinutes)}
          icon={Clock}
          hint="Created to called"
        />
        <StatCard
          label="Avg handling"
          value={formatMinutes(analytics.metrics.avgHandleMinutes)}
          icon={Timer}
          hint="Started to completed"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ticket status</CardTitle>
            <CardDescription>Distribution for the selected range</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusBreakdown
              statusCounts={analytics.statusCounts}
              total={analytics.metrics.ticketsInRange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue summary</CardTitle>
            <CardDescription>Volume, capacity, and average wait</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.queueStats.length > 0 ? (
              analytics.queueStats.map((queue) => (
                <div key={queue.id} className="rounded-xl bg-muted/50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{queue.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {queue.counterCount} counters / {queue.active ? "Active" : "Paused"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {queue.ticketCount}
                      </p>
                      <p className="text-xs text-muted-foreground">tickets</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{queue.completedCount} completed</span>
                    <span>{formatMinutes(queue.avgWaitMinutes)} avg wait</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">No queues configured yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff throughput</CardTitle>
          <CardDescription>
            Tickets are attributed through each ticket&apos;s counter and that counter&apos;s assigned staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium text-right">Counters</th>
                  <th className="pb-2 font-medium text-right">Handled</th>
                  <th className="pb-2 font-medium text-right">Completed</th>
                  <th className="pb-2 font-medium text-right">Avg handling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.staffThroughput.map((staff) => (
                  <tr key={staff.id}>
                    <td className="py-3">
                      <p className="font-medium text-foreground">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.email}</p>
                    </td>
                    <td className="py-3 text-right text-muted-foreground tabular-nums">
                      {staff.assignedCounterCount}
                    </td>
                    <td className="py-3 text-right font-semibold text-foreground tabular-nums">
                      {staff.handledTickets}
                    </td>
                    <td className="py-3 text-right text-muted-foreground tabular-nums">
                      {staff.completedTickets}
                    </td>
                    <td className="py-3 text-right text-muted-foreground tabular-nums">
                      {formatMinutes(staff.avgHandleMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent ticket activity</CardTitle>
          <CardDescription>Latest tickets in the selected range</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Ticket</th>
                    <th className="pb-2 font-medium">Queue</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Wait</th>
                    <th className="pb-2 font-medium text-right">Handling</th>
                    <th className="pb-2 font-medium text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analytics.recentTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="py-2.5">
                        <p className="font-medium text-foreground">{ticket.code}</p>
                        <p className="text-xs text-muted-foreground">{ticket.service}</p>
                      </td>
                      <td className="py-2.5 text-muted-foreground">{ticket.queue}</td>
                      <td className="py-2.5 text-muted-foreground">
                        {STATUS_LABELS[ticket.status] ?? ticket.status}
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground tabular-nums">
                        {formatMinutes(ticket.waitMinutes)}
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground tabular-nums">
                        {formatMinutes(ticket.handleMinutes)}
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground">{ticket.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No ticket activity for this range.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="All-time tickets" value={formatCount(analytics.metrics.allTimeTickets)} icon={Ticket} />
        <StatCard label="Active tickets" value={analytics.metrics.activeTickets} icon={Clock} />
        <StatCard label="Team members" value={analytics.metrics.teamMembers} icon={Users} />
        <StatCard label="Counters" value={analytics.metrics.counters} icon={ListOrdered} />
      </div>
    </div>
  )
}
