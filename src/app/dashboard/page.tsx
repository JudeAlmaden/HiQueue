import Link from "next/link"
import {
  Building2,
  ListOrdered,
  Ticket,
  Users,
  ArrowRight,
  BarChart3,
} from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PLACEHOLDER_TICKETS = [
  { id: "1", number: 42, queue: "General", code: "A-042", status: "Serving" },
  { id: "2", number: 41, queue: "General", code: "A-041", status: "Waiting" },
  { id: "3", number: 18, queue: "Express", code: "B-018", status: "Done" },
]

export default function DashboardOverviewPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, Alex
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening in{" "}
          <span className="font-medium text-foreground">Acme Health Clinic</span> today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tickets today" value={24} icon={Ticket} />
        <StatCard label="Active queues" value={3} icon={ListOrdered} hint="4 total" />
        <StatCard label="Team members" value={8} icon={Users} />
        <StatCard label="All-time tickets" value="1.2k" icon={BarChart3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump into your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Manage queues", href: "#", icon: ListOrdered },
              { label: "View members", href: "#", icon: Users },
              { label: "Staff assignments", href: "#", icon: Building2 },
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
            <CardDescription>Latest activity across all queues</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border -mx-4 px-4">
              {PLACEHOLDER_TICKETS.map((ticket) => (
                <li key={ticket.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      #{ticket.number} · {ticket.queue}
                    </p>
                    <p className="text-xs text-muted-foreground">{ticket.code}</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground shrink-0">
                    {ticket.status}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Signed in as <span className="capitalize">owner</span> ·{" "}
        <Link href="/dashboard/organizations" className="text-primary hover:underline">
          Workspace settings
        </Link>
      </p>
    </div>
  )
}
