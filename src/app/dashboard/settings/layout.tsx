"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Bell, Shield } from "lucide-react"

const settingsNav = [
  { name: "Profile", href: "/dashboard/settings/profile", icon: User },
  { name: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { name: "Security", href: "/dashboard/settings/security", icon: Shield },
]

function isTabActive(pathname: string, href: string) {
  if (href.endsWith("/profile")) {
    return pathname === "/dashboard/settings" || pathname.startsWith(href)
  }
  return pathname.startsWith(href)
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and workspace preferences.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <nav className="sm:w-44 shrink-0 flex sm:flex-col gap-1">
          {settingsNav.map(({ name, href, icon: Icon }) => {
            const active = isTabActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {name}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
