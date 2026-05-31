import { ListOrdered, Ticket, Users, Clock } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { StatusBreakdown } from "@/components/dashboard/StatusBreakdown"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PLACEHOLDER_STATUS = {
  waiting: 12,
  serving: 5,
  done: 48,
  skipped: 3,
  no_show: 2,
}

const PLACEHOLDER_ACTIVITY = [
  { ticket: 42, queue: "General", status: "Serving", created: "Today, 2:14 PM" },
  { ticket: 41, queue: "General", status: "Waiting", created: "Today, 2:08 PM" },
  { ticket: 18, queue: "Express", status: "Done", created: "Today, 1:55 PM" },
  { ticket: 17, queue: "Express", status: "Done", created: "Today, 1:42 PM" },
  { ticket: 40, queue: "General", status: "Skipped", created: "Today, 1:30 PM" },
]

const totalTickets = Object.values(PLACEHOLDER_STATUS).reduce((a, b) => a + b, 0)

export default function AnalyticsPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Queue performance and ticket insights for Acme Health Clinic.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tickets today" value={24} icon={Ticket} />
        <StatCard label="Total tickets" value={70} icon={Clock} />
        <StatCard label="Completion rate" value="69%" icon={ListOrdered} />
        <StatCard label="Team size" value={8} icon={Users} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ticket status</CardTitle>
            <CardDescription>Distribution across all queues</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusBreakdown statusCounts={PLACEHOLDER_STATUS} total={totalTickets} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue summary</CardTitle>
            <CardDescription>Workspace capacity overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Total queues", value: 4 },
              { label: "Active queues", value: 3 },
              { label: "Inactive queues", value: 1 },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold text-foreground tabular-nums">{value}</span>
              </div>
            ))}
            <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
              Chart and export placeholders — connect live data when ready.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Sample ticket log</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Ticket</th>
                  <th className="pb-2 font-medium">Queue</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PLACEHOLDER_ACTIVITY.map((row) => (
                  <tr key={row.ticket}>
                    <td className="py-2.5 font-medium text-foreground">#{row.ticket}</td>
                    <td className="py-2.5 text-muted-foreground">{row.queue}</td>
                    <td className="py-2.5 text-muted-foreground">{row.status}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{row.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
