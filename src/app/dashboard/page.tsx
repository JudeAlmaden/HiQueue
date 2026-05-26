import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Play, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  const userEmail = session?.user?.email || "User"

  // Mock queue data for rich UI
  const activeQueues = [
    { token: "Q-104", name: "Sarah Jenkins", service: "Billing Support", status: "Serving", wait: "12 mins", color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40" },
    { token: "Q-105", name: "David Miller", service: "Account Enquiry", status: "Waiting", wait: "18 mins", color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40" },
    { token: "Q-106", name: "Elena Rostova", service: "Technical Support", status: "Waiting", wait: "24 mins", color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40" },
    { token: "Q-107", name: "Marcus Aurelius", service: "Billing Support", status: "Waiting", wait: "31 mins", color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40" },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm">
            Welcome back, <span className="font-semibold text-slate-700 dark:text-zinc-300">{userEmail}</span>. Here's your queue status for today.
          </p>
        </div>
        <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/10">
          Create New Queue
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
              Customers Currently Waiting
            </CardTitle>
            <Users className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">14</div>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+12%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
              Avg. Waiting Time
            </CardTitle>
            <Clock className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">18.4 mins</div>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-medium">-2.1 mins</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
              Completed Sessions Today
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">84</div>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
              Goal: 100 sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Layout Section: Live Queue Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Queue Table */}
        <Card className="lg:col-span-2 border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Active Queue List</CardTitle>
            <CardDescription className="text-xs text-slate-400 dark:text-zinc-500">
              Real-time monitoring of tokens currently being served or waiting.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-850 text-slate-400 dark:text-zinc-500">
                  <th className="py-3 font-semibold">Token</th>
                  <th className="py-3 font-semibold">Customer</th>
                  <th className="py-3 font-semibold">Service Desk</th>
                  <th className="py-3 font-semibold text-center">Status</th>
                  <th className="py-3 font-semibold">Wait Time</th>
                  <th className="py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {activeQueues.map((item) => (
                  <tr key={item.token} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3.5 font-bold text-indigo-600 dark:text-indigo-400">{item.token}</td>
                    <td className="py-3.5 font-medium">{item.name}</td>
                    <td className="py-3.5 text-slate-500 dark:text-zinc-400">{item.service}</td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${item.color}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500 dark:text-zinc-400">{item.wait}</td>
                    <td className="py-3.5 text-right">
                      <Button variant="ghost" size="sm" className="h-8 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400">
                        {item.status === "Serving" ? "Complete" : "Call Next"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Counter status / Info Panel */}
        <div className="space-y-6">
          <Card className="border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Counter Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-zinc-800">
                <div>
                  <h4 className="font-semibold text-sm">Counter 1 - General</h4>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">Agent: Alex Rivera</p>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-zinc-800">
                <div>
                  <h4 className="font-semibold text-sm">Counter 2 - Support</h4>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">Agent: Jessica Wong</p>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-zinc-800 opacity-60">
                <div>
                  <h4 className="font-semibold text-sm">Counter 3 - Inquiries</h4>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">Offline</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-zinc-700"></span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats / Info */}
          <Card className="border-slate-200/60 dark:border-zinc-800 bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-150 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <AlertCircle className="h-5 w-5" />
                <CardTitle className="text-sm font-bold">Workspace Health</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-indigo-900/80 dark:text-indigo-300/80 space-y-2">
              <p>Everything is running smoothly! Load density is low right now.</p>
              <p className="font-semibold">Estimated general wait time: ~10 mins</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
