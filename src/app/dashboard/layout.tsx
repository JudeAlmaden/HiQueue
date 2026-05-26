import { auth, signOut } from "@/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  LayoutDashboard, 
  ListOrdered, 
  BarChart3, 
  Settings, 
  LogOut, 
  Users, 
  Layers 
} from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const userEmail = session?.user?.email || "User"
  const userInitials = userEmail.substring(0, 2).toUpperCase()

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live Queues", href: "#", icon: ListOrdered },
    { name: "Customers", href: "#", icon: Users },
    { name: "Analytics", href: "#", icon: BarChart3 },
    { name: "Settings", href: "#", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo / Header */}
          <div className="flex items-center justify-between px-6 pb-6 border-b border-slate-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-zinc-100 dark:to-indigo-400 bg-clip-text text-transparent">
                HiQueue
              </span>
            </div>
            <ThemeToggle />
          </div>

          {/* Nav Links */}
          <nav className="mt-6 flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-all duration-150"
              >
                <item.icon className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Profile / Logout */}
        <div className="flex-shrink-0 flex border-t border-slate-200 dark:border-zinc-800 p-4 bg-slate-50/50 dark:bg-zinc-900/40">
          <div className="flex items-center w-full gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-zinc-200 truncate">
                {userEmail}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500 truncate">
                Workspace Admin
              </p>
            </div>
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                type="submit"
                className="h-8 w-8 text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1 w-full">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 flex md:hidden items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              HiQueue
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-slate-500 dark:text-zinc-400">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
