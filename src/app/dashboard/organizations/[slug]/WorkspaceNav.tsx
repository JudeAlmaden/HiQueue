"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, ListOrdered, CalendarRange } from "lucide-react"

interface Props {
  slug: string
}

export function WorkspaceNav({ slug }: Props) {
  const pathname = usePathname()

  const tabs = [
    {
      name: "Overview",
      href: `/dashboard/organizations/${slug}`,
      icon: LayoutDashboard,
      active: pathname === `/dashboard/organizations/${slug}`
    },
    {
      name: "Members",
      href: `/dashboard/organizations/${slug}/members`,
      icon: Users,
      active: pathname.startsWith(`/dashboard/organizations/${slug}/members`)
    },
    {
      name: "Queues",
      href: `/dashboard/organizations/${slug}/queues`,
      icon: ListOrdered,
      active: pathname.startsWith(`/dashboard/organizations/${slug}/queues`)
    },
    {
      name: "Assignments",
      href: `/dashboard/organizations/${slug}/assignments`,
      icon: CalendarRange,
      active: pathname.startsWith(`/dashboard/organizations/${slug}/assignments`)
    }
  ]

  return (
    <nav className="flex items-center gap-1.5 p-1 bg-surface-low rounded-xl border border-border/60 max-w-max">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              tab.active
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {tab.name}
          </Link>
        )
      })}
    </nav>
  )
}
