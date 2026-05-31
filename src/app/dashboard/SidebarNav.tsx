"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  Users,
  ListOrdered,
  CalendarRange,
  SlidersHorizontal,
} from "lucide-react"

interface Organization {
  id: string
  name: string
  slug: string
}

interface SidebarNavProps {
  organization: Organization | null
}

export default function SidebarNav({ organization }: SidebarNavProps) {
  const pathname = usePathname()

  const mainNavItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, exact: false },
  ]

  const workspaceNavItems = organization
    ? [
        {
          name: "Workspace",
          href: `/dashboard/organizations/${organization.slug}`,
          icon: LayoutDashboard,
          match: "exact" as const,
        },
        {
          name: "Members",
          href: `/dashboard/organizations/${organization.slug}/members`,
          icon: Users,
          match: "prefix" as const,
        },
        {
          name: "Queues",
          href: `/dashboard/organizations/${organization.slug}/queues`,
          icon: ListOrdered,
          match: "prefix" as const,
        },
        {
          name: "Assignments",
          href: `/dashboard/organizations/${organization.slug}/assignments`,
          icon: CalendarRange,
          match: "prefix" as const,
        },
        {
          name: "Workspace settings",
          href: "/dashboard/organizations",
          icon: SlidersHorizontal,
          match: "exact" as const,
        },
      ]
    : []

  function isMainActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  function isWorkspaceActive(href: string, match: "exact" | "prefix") {
    if (match === "exact") return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  function navLinkClass(active: boolean) {
    return `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
      active
        ? "bg-primary text-on-primary shadow-sm"
        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-low"
    }`
  }

  function iconClass(active: boolean) {
    return `h-4 w-4 shrink-0 ${active ? "text-on-primary" : "text-on-surface-variant"}`
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <nav className="px-4 space-y-1">
        {mainNavItems.map((item) => {
          const active = isMainActive(item.href, item.exact)
          return (
            <Link key={item.name} href={item.href} className={navLinkClass(active)}>
              <item.icon className={iconClass(active)} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {organization && (
        <div className="mt-8 px-4 flex-1 min-h-0">
          <div className="flex items-center gap-2.5 px-3 mb-3 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary-container text-on-secondary-container">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-semibold text-on-surface truncate">{organization.name}</p>
          </div>

          <nav className="space-y-1">
            {workspaceNavItems.map((item) => {
              const active = isWorkspaceActive(item.href, item.match)
              return (
                <Link key={item.href} href={item.href} className={navLinkClass(active)}>
                  <item.icon className={iconClass(active)} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}
