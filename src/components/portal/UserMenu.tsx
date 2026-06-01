"use client"

import { useState, useRef, useEffect } from "react"
import { LogOut } from "lucide-react"

const ROLE_THEMES: Record<
  string,
  {
    gradient: string
    badge: string
    dot: string
    text: string
  }
> = {
  owner: {
    gradient: "from-amber-100 to-amber-200 dark:from-amber-950/40 dark:to-amber-900/40",
    badge: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800/30",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
  },
  admin: {
    gradient: "from-primary to-primary-container",
    badge: "bg-primary/10 text-primary border border-primary/20",
    dot: "bg-primary",
    text: "text-primary",
  },
  staff: {
    gradient: "from-outline to-outline/60",
    badge: "bg-outline/10 text-outline border border-outline/20",
    dot: "bg-outline",
    text: "text-outline",
  },
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ")
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase()
  }
  return (email ?? "??").slice(0, 2).toUpperCase()
}

interface Props {
  role: string
  userName?: string | null
  userEmail?: string | null
  signOutAction: () => Promise<void>
}

export function UserMenu({ role, userName, userEmail, signOutAction }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const config = ROLE_THEMES[role] ?? ROLE_THEMES.staff
  const initials = getInitials(userName, userEmail)
  const displayName = userName || userEmail || "User"

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="User menu"
      >
        {/* Gradient ring */}
        <span
          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${config.gradient} p-[2px]`}
        >
          <span className="flex h-full w-full items-center justify-center rounded-[10px] bg-surface text-[11px] font-extrabold text-on-surface">
            {initials}
          </span>
        </span>
        {/* Online dot */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${config.dot}`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-outline-variant bg-surface-container shadow-xl animate-scale-up origin-top-right overflow-hidden p-2.5 space-y-2">
          {/* User info block */}
          <div className="px-2.5 py-3 flex items-center gap-3 rounded-xl bg-surface-container-high/40">
            {/* Large avatar */}
            <span
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} text-white text-xs font-black shadow-md`}
            >
              {initials}
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm font-extrabold text-on-surface truncate leading-tight">
                {displayName}
              </p>
              {userEmail && userName && (
                <p className="text-[11px] font-medium text-on-surface-variant/80 truncate leading-none">
                  {userEmail}
                </p>
              )}
              <div className="pt-1">
                <span
                  className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${config.badge}`}
                >
                  {role}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant/40 my-1 mx-1.5" />

          {/* Action Links */}
          <div className="space-y-1">
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
