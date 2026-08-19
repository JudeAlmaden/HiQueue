"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Info,
  Building2,
  Users,
  ListOrdered,
  Layers,
  Smartphone,
  Monitor,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  QrCode,
  Tv,
  ChevronRight,
  UserCheck,
  Ticket,
  Plus,
  Key,
  Volume2,
  Clock,
  RefreshCw,
  UserX,
  Check,
  ShieldCheck,
  Code2,
  Briefcase,
  HeartPulse,
  Landmark,
  GraduationCap,
  Sparkle,
  SlidersHorizontal,
  ArrowRight,
  GitFork,
  LogIn,
  Link2,
  HelpCircle,
  BarChart3,
  CalendarRange,
  Palette,
  LayoutDashboard,
  WifiOff,
  Shuffle,
  Globe,
  Pause,
  SkipForward,
  XCircle,
  CheckCircle,
  Database,
  Cpu,
  ArrowDownRight,
  Sparkles as SparkleIcon,
  BadgeCheck,
  BookmarkCheck,
  Zap,
  Lock,
  User,
  ShieldAlert,
  MousePointerClick,
  Sliders,
  TrendingUp,
  LineChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeaturesClientProps {
  isLoggedIn: boolean
}

type SectionKey = "about" | "hierarchy" | "logins" | "step1" | "step2" | "step3" | "step4" | "step5" | "analytics" | "faq"

export function FeaturesClient({ isLoggedIn }: FeaturesClientProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>("about")
  const [calledTicket, setCalledTicket] = useState<{ number: string; counter: string }>({
    number: "A-014",
    counter: "Counter 2",
  })

  const sidebarNav = [
    {
      id: "about" as SectionKey,
      title: "About HiQueue",
      subtitle: "System Overview & Mission",
      icon: Info,
    },
    {
      id: "hierarchy" as SectionKey,
      title: "System Hierarchy",
      subtitle: "Org -> Queue -> Service -> Counter",
      icon: GitFork,
    },
    {
      id: "logins" as SectionKey,
      title: "How People Log In",
      subtitle: "Admins vs Staff vs Customers",
      icon: LogIn,
    },
    {
      id: "step1" as SectionKey,
      title: "Step 1: Workspace & Team",
      subtitle: "Organizations & Member Roles",
      icon: Building2,
    },
    {
      id: "step2" as SectionKey,
      title: "Step 2: Queues & Services",
      subtitle: "Wait Queues & Service Prefixes",
      icon: ListOrdered,
    },
    {
      id: "step3" as SectionKey,
      title: "Step 3: Counters & Mapping",
      subtitle: "Desks & Multi-Service Mapping",
      icon: Layers,
    },
    {
      id: "step4" as SectionKey,
      title: "Step 4: Kiosks & Displays",
      subtitle: "Customer Tablets & Lounge Screens",
      icon: Monitor,
    },
    {
      id: "step5" as SectionKey,
      title: "Step 5: Daily Calling Console",
      subtitle: "1-Click Ticket Calling Actions",
      icon: PhoneCall,
    },
    {
      id: "analytics" as SectionKey,
      title: "Analytics & Custom Themes",
      subtitle: "Performance Metrics & Portal Branding",
      icon: BarChart3,
    },
    {
      id: "faq" as SectionKey,
      title: "Comprehensive FAQ",
      subtitle: "Concurrency, Offlines, Holds, & Reset",
      icon: HelpCircle,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            ✦ HiQueue Detailed Setup Guide & System Capabilities
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          System Documentation & Setup Workflow
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Detailed chronological setup flow (Steps 1 to 5), entity hierarchies, service prefix ownership, multi-service counter routing, and supported vs unsupported system capabilities.
        </p>
      </div>

      {/* Two-Column Sidebar Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-4 sticky top-20 z-20 space-y-2 bg-card border border-border rounded-3xl p-4 shadow-sm">
          <div className="px-3 py-2 text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
            Documentation Index
          </div>

          <div className="space-y-1">
            {sidebarNav.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-foreground hover:bg-surface-container/60 hover:text-foreground font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                        isActive
                          ? "bg-primary-foreground text-primary"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs truncate font-extrabold">{item.title}</div>
                      <div className={`text-[10px] truncate ${isActive ? "opacity-90" : "text-muted-foreground"}`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 ${isActive ? "opacity-100" : "opacity-40"}`} />
                </button>
              )
            })}
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="lg:col-span-8 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
          {/* ABOUT HIQUEUE */}
          {activeSection === "about" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-3 border-b border-border pb-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    ABOUT HIQUEUE
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Open Source System</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  Smart Queue Management for Walk-In Businesses
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  HiQueue is an open-source, web-native queue management platform engineered to eliminate waiting room chaos, issue digital tickets, and streamline walk-in operations across physical service desks.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-extrabold text-foreground text-base">Architectural Philosophy & Hardware Freedom</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Unlike traditional legacy queue systems that require expensive proprietary thermal printers, hardware kiosks, and complex local server setups, HiQueue runs <strong>100% in the cloud on web standards</strong>. Any tablet, iPad, smartphone, TV monitor, or PC browser functions instantly as an entrance kiosk, calling desk, or lounge screen.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-extrabold text-foreground text-base">Key System Capabilities</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-surface-container/60 border border-border space-y-2">
                    <div className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary shrink-0" /> App-Less Customer Check-In
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Visitors check in at a touchscreen tablet kiosk (<code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">/live/[queueId]</code>) or scan a QR code to track their position live on their mobile browser without downloading any native mobile application.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-container/60 border border-border space-y-2">
                    <div className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary shrink-0" /> Multi-Counter Dynamic Routing
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Staff desks can serve multiple service categories concurrently. When staff click <strong>Call Next</strong>, HiQueue automatically locks and dispatches the oldest unserved ticket across all mapped services.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-container/60 border border-border space-y-2">
                    <div className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2">
                      <Tv className="h-4 w-4 text-primary shrink-0" /> Fullscreen Lounge TV Chimes
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Mount any Smart TV or computer screen in your waiting lounge (<code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">/org/[slug]/display/[queueId]</code>) to broadcast real-time ticket calls with audible chime notifications.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-container/60 border border-border space-y-2">
                    <div className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary shrink-0" /> PIN Passcode Queue Security
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Protect restricted queues (e.g. VIP lounges or staff consultations) with 4-digit PIN passcodes that visitors must enter at the kiosk before a ticket is issued.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-container/60 border border-border space-y-2">
                    <div className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary shrink-0" /> PostgreSQL Atomic Concurrency
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Atomic row locking guarantees zero race conditions or duplicate ticket calls, even when dozens of staff members call tickets simultaneously during peak rush hours.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-container/60 border border-border space-y-2">
                    <div className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2">
                      <Pause className="h-4 w-4 text-primary shrink-0" /> Hold & Recall Staff Controls
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Full operational flexibility with 1-click console actions: <strong>Call Next</strong>, <strong>Recall Chime</strong>, <strong>Hold</strong>, <strong>Recall from Hold</strong>, <strong>Complete</strong>, <strong>Skip</strong>, and <strong>No-Show</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-extrabold text-foreground text-base">Designed for Walk-In Environments</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3.5 bg-card border border-border rounded-xl flex items-center gap-3">
                    <HeartPulse className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">Medical Clinics & Hospitals</div>
                      <div className="text-xs text-muted-foreground">Outpatient triage, consultations, & pharmacy release desks.</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-card border border-border rounded-xl flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">Government & Municipal Desks</div>
                      <div className="text-xs text-muted-foreground">Civil registries, driver licensing, & passport processing.</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-card border border-border rounded-xl flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">Banks & Financial Institutions</div>
                      <div className="text-xs text-muted-foreground">Teller windows, loan inquiries, & customer support.</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-card border border-border rounded-xl flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">Universities & Service Hubs</div>
                      <div className="text-xs text-muted-foreground">Student admissions, registrar offices, & financial aid desks.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM HIERARCHY */}
          {activeSection === "hierarchy" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-3 border-b border-border pb-5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  CORE SYSTEM CONCEPTS
                </span>
                <h2 className="text-2xl font-extrabold text-foreground">
                  System Structure & Entity Hierarchy
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  HiQueue follows a strict 4-tier relational model. Below is a clean, spacious breakdown of how Organizations, Queues, Services, Counters, and Staff Assignments interact.
                </p>
              </div>

              <div className="space-y-3 border-b border-border pb-6">
                <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
                  <BookmarkCheck className="h-5 w-5 text-primary" /> Executive Summary · Core Hierarchy Takeaways
                </h3>
                <div className="space-y-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed pl-1">
                  <p>
                    <strong className="text-foreground">1. Organization (Workspace Root):</strong> Parent root entity owning team members (<code className="bg-muted px-1.5 py-0.5 rounded text-xs">Owner</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Admin</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Staff</code>), custom URL slug partitioning (<code className="bg-muted px-1.5 py-0.5 rounded text-xs">/org/[slug]</code>), and portal themes.
                  </p>
                  <p>
                    <strong className="text-foreground">2. Queue (Department Container):</strong> Physical waitlist container grouping child services & counters. Owns PIN passcodes and lounge TV screens. Does <em>not</em> own prefixes directly.
                  </p>
                  <p>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold">3. Service (Code Prefix Owner):</strong> Each Service category owns its single-letter code prefix (<code className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-mono font-bold">prefix: "A"</code> → issues tickets <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold">A-001</code>).
                  </p>
                  <p>
                    <strong className="text-foreground">4. Counter (Multi-Service Desk):</strong> Physical desk operated by staff. Mapped to 1 or more Services. When staff click <strong>Call Next</strong>, HiQueue dispatches the oldest waiting ticket across mapped services.
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-surface-container/60 border border-border space-y-6">
                <h3 className="font-extrabold text-foreground text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <GitFork className="h-5 w-5 text-primary" /> Visual Entity Relationship Tree
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">Prisma DB Architecture</span>
                </h3>

                <div className="space-y-6 text-sm">
                  <div className="p-5 bg-card border-2 border-primary/40 rounded-2xl space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-foreground text-base flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" /> 1. Organization (Workspace Entity)
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary">
                        Parent Model: Organization
                      </span>
                    </div>
                    <p className="text-muted-foreground pl-7 leading-relaxed text-xs sm:text-sm">
                      The top-level root account representing your business or branch (e.g. <code className="bg-muted px-1.5 py-0.5 rounded">City Central Medical Center</code>). It owns user memberships (<code className="bg-muted px-1.5 py-0.5 rounded">Owner</code>, <code className="bg-muted px-1.5 py-0.5 rounded">Admin</code>, <code className="bg-muted px-1.5 py-0.5 rounded">Staff</code>), portal themes, and multiple wait queues.
                    </p>
                  </div>

                  <div className="pl-6 border-l-2 border-dashed border-primary/30 space-y-6">
                    <div className="p-5 bg-card border border-border rounded-2xl space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-foreground text-base flex items-center gap-2">
                          <ListOrdered className="h-5 w-5 text-primary" /> 2. Queue (Department Container)
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-surface-container text-foreground">
                          Child Model: Queue
                        </span>
                      </div>
                      <p className="text-muted-foreground pl-7 leading-relaxed text-xs sm:text-sm">
                        A designated department container waitlist (e.g. <code className="bg-muted px-1.5 py-0.5 rounded">Main Outpatient Reception</code> or <code className="bg-muted px-1.5 py-0.5 rounded">Pharmacy Dept</code>). Queues do <strong>not</strong> own prefixes directly; instead, queues group child <strong>Services</strong> and physical <strong>Counters</strong> together.
                      </p>
                    </div>

                    <div className="pl-6 border-l-2 border-dashed border-primary/30 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-5 bg-card border-2 border-emerald-500/40 rounded-2xl space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-foreground text-sm flex items-center gap-2">
                              <Layers className="h-4 w-4 text-emerald-600" /> 3. Services (Prefix Owner)
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600">
                              Service.prefix
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed text-xs">
                            <strong>Prefixes belong to Services!</strong> Each Service category owns its single-letter prefix string:
                          </p>
                          <div className="space-y-1.5 text-xs font-mono">
                            <div className="p-2 bg-surface-container/60 rounded-xl border border-border flex items-center justify-between">
                              <span>General Consultations</span>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">prefix: "A" → A-001</span>
                            </div>
                            <div className="p-2 bg-surface-container/60 rounded-xl border border-border flex items-center justify-between">
                              <span>Pharmacy & Release</span>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">prefix: "B" → B-001</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 bg-card border border-border rounded-2xl space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-foreground text-sm flex items-center gap-2">
                              <Ticket className="h-4 w-4 text-primary" /> 4. Counters (Physical Desks)
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-surface-container text-foreground">
                              Model: Counter
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed text-xs">
                            Physical desks or windows (e.g. <code className="bg-muted px-1.5 py-0.5 rounded">Desk 1</code>, <code className="bg-muted px-1.5 py-0.5 rounded">Window 2</code>) operated by staff members. Counters are mapped to serve 1 or more Services within the Queue.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl space-y-2 text-xs sm:text-sm">
                      <div className="font-bold text-primary flex items-center gap-2">
                        <Link2 className="h-4 w-4" /> Service Mapping & Dynamic Ticket Dispatching
                      </div>
                      <p className="text-muted-foreground pl-6 leading-relaxed text-xs">
                        Counters link to services via <code className="bg-card px-1.5 py-0.5 rounded font-mono">CounterServiceMapping</code>. When staff at Desk 1 click <strong>Call Next</strong>, HiQueue queries all unserved tickets across mapped services, locks the oldest ticket in PostgreSQL, and dispatches it to Desk 1!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-surface-container/60 border border-border space-y-8">
                <div className="space-y-2 border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      ENTERPRISE MULTI-QUEUE CASE STUDY
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">Workspace Slug: city-medical</span>
                  </div>
                  <h3 className="font-extrabold text-foreground text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" /> Real-World Organization Structure · "City Central Medical Center"
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                    This organization operates <strong>3 distinct department queues</strong>, where each service category owns its single-letter code prefix.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-2 font-extrabold text-foreground text-sm sm:text-base">
                        <HeartPulse className="h-5 w-5 text-primary" /> Queue 1: Main Outpatient Reception
                      </div>
                      <span className="text-xs font-mono bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-bold">
                        Public Container Queue
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-xs sm:text-sm">
                      <div className="space-y-2">
                        <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">Services Configured (Prefix Owners)</span>
                        <div className="space-y-2">
                          <div className="p-3 bg-surface-container/60 border border-border rounded-xl flex items-center justify-between">
                            <div>
                              <div className="font-bold text-foreground">Service A: General Consultations</div>
                              <div className="text-[11px] text-muted-foreground">Issued Tickets: A-001, A-002...</div>
                            </div>
                            <span className="px-2.5 py-1 rounded font-mono font-bold bg-primary/10 text-primary text-xs">
                              prefix: "A"
                            </span>
                          </div>

                          <div className="p-3 bg-surface-container/60 border border-border rounded-xl flex items-center justify-between">
                            <div>
                              <div className="font-bold text-foreground">Service B: Triage & Vitals</div>
                              <div className="text-[11px] text-muted-foreground">Issued Tickets: B-001, B-002...</div>
                            </div>
                            <span className="px-2.5 py-1 rounded font-mono font-bold bg-primary/10 text-primary text-xs">
                              prefix: "B"
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">Physical Desks & Staff Assignments</span>
                        <div className="space-y-2">
                          <div className="p-3 bg-surface-container/60 border border-border rounded-xl space-y-1">
                            <div className="font-bold text-foreground flex items-center justify-between">
                              <span>Desk 1 (Nurse Sarah)</span>
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Multi-Service Desk</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Mapped Services: <strong>Service A & Service B</strong></div>
                          </div>

                          <div className="p-3 bg-surface-container/60 border border-border rounded-xl space-y-1">
                            <div className="font-bold text-foreground flex items-center justify-between">
                              <span>Desk 2 (Nurse Alex)</span>
                              <span className="text-[10px] bg-surface-container text-foreground px-2 py-0.5 rounded font-bold">Dedicated Desk</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Mapped Services: <strong>Service A only</strong></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-2 font-extrabold text-foreground text-sm sm:text-base">
                        <Briefcase className="h-5 w-5 text-primary" /> Queue 2: Pharmacy & Billing Department
                      </div>
                      <span className="text-xs font-mono bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-bold">
                        Public Container Queue
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-xs sm:text-sm">
                      <div className="space-y-2">
                        <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">Services Configured (Prefix Owners)</span>
                        <div className="space-y-2">
                          <div className="p-3 bg-surface-container/60 border border-border rounded-xl flex items-center justify-between">
                            <div>
                              <div className="font-bold text-foreground">Service C: Prescriptions & Release</div>
                              <div className="text-[11px] text-muted-foreground">Issued Tickets: C-001, C-002...</div>
                            </div>
                            <span className="px-2.5 py-1 rounded font-mono font-bold bg-primary/10 text-primary text-xs">
                              prefix: "C"
                            </span>
                          </div>

                          <div className="p-3 bg-surface-container/60 border border-border rounded-xl flex items-center justify-between">
                            <div>
                              <div className="font-bold text-foreground">Service D: Cashier Billing</div>
                              <div className="text-[11px] text-muted-foreground">Issued Tickets: D-001, D-002...</div>
                            </div>
                            <span className="px-2.5 py-1 rounded font-mono font-bold bg-primary/10 text-primary text-xs">
                              prefix: "D"
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">Physical Desks & Staff Assignments</span>
                        <div className="space-y-2">
                          <div className="p-3 bg-surface-container/60 border border-border rounded-xl space-y-1">
                            <div className="font-bold text-foreground flex items-center justify-between">
                              <span>Window 1 (Michael)</span>
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Multi-Service Desk</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Mapped Services: <strong>Service C & Service D</strong></div>
                          </div>

                          <div className="p-3 bg-surface-container/60 border border-border rounded-xl space-y-1">
                            <div className="font-bold text-foreground flex items-center justify-between">
                              <span>Window 2 (Emily)</span>
                              <span className="text-[10px] bg-surface-container text-foreground px-2 py-0.5 rounded font-bold">Dedicated Desk</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Mapped Services: <strong>Service C only</strong></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-2 font-extrabold text-foreground text-sm sm:text-base">
                        <ShieldCheck className="h-5 w-5 text-amber-600" /> Queue 3: VIP & Executive Express Lounge
                      </div>
                      <span className="text-xs font-mono bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full font-bold">
                        PIN Code 8888 Protected
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-xs sm:text-sm">
                      <div className="space-y-2">
                        <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">Services Configured</span>
                        <div className="p-3 bg-surface-container/60 border border-border rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-foreground">Service V: VIP Fast-Track</div>
                            <div className="text-[11px] text-muted-foreground">Issued Tickets: V-001, V-002...</div>
                          </div>
                          <span className="px-2.5 py-1 rounded font-mono font-bold bg-amber-500/10 text-amber-600 text-xs">
                            prefix: "V"
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">Physical Desks & Staff</span>
                        <div className="p-3 bg-surface-container/60 border border-border rounded-xl space-y-1">
                          <div className="font-bold text-foreground flex items-center justify-between">
                            <span>VIP Desk 1 (Dr. Mercer)</span>
                            <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-bold">VIP Desk</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Mapped Services: <strong>Service V</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="font-extrabold text-foreground text-sm uppercase tracking-wider">
                    Customer Operational Journey Across Departments
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-card border border-border rounded-2xl flex items-start gap-4 shadow-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-sm">1</span>
                      <div className="space-y-1">
                        <div className="font-bold text-foreground text-sm sm:text-base">Patient Check-In at Main Reception</div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Patient John walks up to the Reception kiosk tablet (<code className="bg-muted px-1.5 py-0.5 rounded text-xs">/live/reception-queue</code>), selects <strong>General Consultations (Service A)</strong>, and receives ticket <code className="bg-muted px-1.5 py-0.5 rounded text-xs">A-014</code> with a mobile QR tracking link on his phone.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-card border border-border rounded-2xl flex items-start gap-4 shadow-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-sm">2</span>
                      <div className="space-y-1">
                        <div className="font-bold text-foreground text-sm sm:text-base">Nurse Calls Ticket at Multi-Service Desk 1</div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Nurse Sarah at Desk 1 (mapped to Service A & B) clicks <strong>Call Next</strong>. HiQueue's PostgreSQL transaction locks ticket <code className="bg-muted px-1.5 py-0.5 rounded text-xs">A-014</code> to Desk 1 and triggers an audio chime on the Reception TV Screen (<code className="bg-muted px-1.5 py-0.5 rounded text-xs">.../display/reception-queue</code>).
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-card border border-border rounded-2xl flex items-start gap-4 shadow-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-sm">3</span>
                      <div className="space-y-1">
                        <div className="font-bold text-foreground text-sm sm:text-base">Completion & Transition to Pharmacy Queue</div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          After John completes his doctor consultation, Nurse Sarah clicks <strong>Complete</strong>. John walks over to the Pharmacy Department kiosk (<code className="bg-muted px-1.5 py-0.5 rounded text-xs">/live/pharmacy-queue</code>) and gets prescription ticket <code className="bg-muted px-1.5 py-0.5 rounded text-xs">C-005</code> from <strong>Service C (Prescriptions)</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-card border border-border rounded-2xl flex items-start gap-4 shadow-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-sm">4</span>
                      <div className="space-y-1">
                        <div className="font-bold text-foreground text-sm sm:text-base">Ticket Hold & Recall Operational Action</div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Staff Emily at Pharmacy Window 2 calls <code className="bg-muted px-1.5 py-0.5 rounded text-xs">C-005</code>. John realizes he forgot his insurance card in his car. Emily clicks <strong>Hold</strong> on her console to serve other patients. When John returns 5 minutes later, Emily clicks <strong>Recall from Hold</strong> and completes his prescription!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HOW PEOPLE LOG IN */}
          {activeSection === "logins" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-3 border-b border-border pb-5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  USER ACCESS & LOGIN FLOWS
                </span>
                <h2 className="text-2xl font-extrabold text-foreground">
                  How Everyone Logins and Accesses HiQueue
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  HiQueue has 3 different types of users: <strong>Bosses/Admins</strong>, <strong>Frontline Staff</strong>, and <strong>Walk-In Customers</strong>. Here is a simple, step-by-step guide on how each person logs in and uses the app.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-surface-container/60 border border-border space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="font-extrabold text-foreground text-base sm:text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> 1. Business Owners & Admins (The Bosses)
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-card border border-border text-foreground">
                    Web Link: /login
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Who they are:</strong> Store managers, clinic directors, or IT admins who build the system and manage the team.
                  </p>
                  
                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-foreground text-xs uppercase tracking-wider">Step-by-Step Login & Control Flow:</div>
                    <div className="p-3 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs">Step A: Go to Main Admin Login</div>
                      <p className="text-xs">They open <code className="bg-muted px-1.5 py-0.5 rounded">/login</code> on any computer or phone browser and type their master email and password.</p>
                    </div>

                    <div className="p-3 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs">Step B: Land on Organization Control Center</div>
                      <p className="text-xs">Once logged in, they land on their <strong>Workspace Overview Dashboard</strong> (<code className="bg-muted px-1.5 py-0.5 rounded">/dashboard</code>) where they see real-time queue graphs, staff attendance, and ticket totals.</p>
                    </div>

                    <div className="p-3 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs">Step C: Manage Settings & Staff</div>
                      <p className="text-xs">Admins can create new wait queues (e.g. <em>Reception</em>, <em>Pharmacy</em>), add or remove staff accounts, map who works at which desk, and change portal theme colors.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-surface-container/60 border border-border space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="font-extrabold text-foreground text-base sm:text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" /> 2. Frontline Staff (Nurses, Tellers, Receptionists)
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-card border border-border text-foreground">
                    Web Link: /org/[your-company-name]/login
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Who they are:</strong> The workers sitting at physical service desks (e.g. Counter 1, Window 2) calling waiting customers into their office.
                  </p>

                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-foreground text-xs uppercase tracking-wider">Step-by-Step Daily Staff Workflow:</div>
                    <div className="p-3 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs">Step A: Open Branded Company Portal</div>
                      <p className="text-xs">Staff open their business's custom website link (e.g. <code className="bg-muted px-1.5 py-0.5 rounded">/org/city-medical/login</code>) on their counter desktop computer or tablet.</p>
                    </div>

                    <div className="p-3 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs">Step B: Log In with Staff Account</div>
                      <p className="text-xs">They type their staff username and password given to them by their manager.</p>
                    </div>

                    <div className="p-3 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs">Step C: Pick Physical Desk & Start Calling</div>
                      <p className="text-xs">They select their assigned desk (e.g. <em>Desk 1</em>) and open the Calling Console. Staff click <strong>Call Next</strong> to ring the waiting room chime and pull the next customer!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                  <div className="font-extrabold text-foreground text-base sm:text-lg flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-emerald-600" /> 3. Walk-In Customers & Visitors
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white font-mono">
                    NO LOGIN OR PASSWORD NEEDED!
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Who they are:</strong> Patients, clients, shoppers, or visitors walking through your front door.
                  </p>

                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-foreground text-xs uppercase tracking-wider">Step-by-Step Customer Journey:</div>
                    <div className="p-3 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs">Step A: Tap Kiosk Tablet at Front Door</div>
                      <p className="text-xs">Customer walks up to the entrance iPad or tablet (<code className="bg-muted px-1.5 py-0.5 rounded">/live/queue-name</code>) and taps the service they need (e.g. <em>General Consultations</em>).</p>
                    </div>

                    <div className="p-3 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs">Step B: Get Digital Ticket & Mobile QR Code</div>
                      <p className="text-xs">The tablet shows their ticket number (e.g. <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold">A-014</code>). Customer scans the on-screen QR code with their phone camera to watch their place in line while sitting in the lounge or grabbing coffee nearby!</p>
                    </div>

                    <div className="p-3 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs">Step C: Watch Waiting Room TV Screen</div>
                      <p className="text-xs">When staff click "Call Next", the waiting room TV (<code className="bg-muted px-1.5 py-0.5 rounded">.../display/queue-name</code>) plays a chime sound and flashes <strong className="text-foreground font-mono">A-014 → Please Proceed to Counter 2</strong>!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: WORKSPACE & TEAM */}
          {activeSection === "step1" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-3 border-b border-border pb-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    STEP 1 OF 5
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">URL: /dashboard/organizations/[slug]</span>
                </div>
                <h2 className="text-2xl font-extrabold text-foreground">
                  Step 1: Set Up Workspace & Invite Team Members
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Think of an <strong>Organization Workspace</strong> as your company's digital headquarters in HiQueue. It groups your branch name, team members, and waiting queues under one roof.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle className="h-4 w-4" /> What You Can Do (Supported)
                  </div>
                  <ul className="space-y-1 text-muted-foreground leading-relaxed">
                    <li>• Invite multiple managers and staff to your company.</li>
                    <li>• Assign specific role permissions (<code className="bg-muted px-1 py-0.5 rounded text-[10px]">Owner</code>, <code className="bg-muted px-1 py-0.5 rounded text-[10px]">Admin</code>, <code className="bg-muted px-1 py-0.5 rounded text-[10px]">Staff</code>).</li>
                    <li>• Set your custom business URL link (e.g. <code className="bg-muted px-1 py-0.5 rounded text-[10px]">health-clinic</code>).</li>
                    <li>• Generate a custom staff login portal at <code className="bg-muted px-1 py-0.5 rounded text-[10px]">/org/[slug]/login</code>.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                    <XCircle className="h-4 w-4" /> System Limitations
                  </div>
                  <ul className="space-y-1 text-muted-foreground leading-relaxed">
                    <li>• Staff members cannot log into a company's counters unless an Admin invites their email first.</li>
                    <li>• Your web link (URL slug) must be letters, numbers, and dashes (no spaces or special symbols).</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-primary" /> How to Use the UI Screen (Step-by-Step Guide)
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">1</span>
                      How to Open This Page in the Left Sidebar
                    </div>
                    <p className="pl-8 text-xs">
                      Look at the main dashboard sidebar menu on the left. Click on <strong>Workspace Settings</strong> under your organization name (or navigate to <code className="bg-card px-1.5 py-0.5 rounded">/dashboard/organizations/[slug]</code>).
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">2</span>
                      How to Invite a New Staff Member Button
                    </div>
                    <p className="pl-8 text-xs">
                      On the top right of the <strong>Workspace Members</strong> box, click the <strong className="text-foreground">+ Invite Member</strong> button. A pop-up dialog will appear asking for their email address and role.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">3</span>
                      Choosing the Right Role Permissions
                    </div>
                    <div className="pl-8 space-y-1.5 text-xs">
                      <p>• <strong className="text-foreground font-mono">Owner:</strong> Has 100% control over billing, deleting the workspace, and editing all queues and team members.</p>
                      <p>• <strong className="text-foreground font-mono">Admin:</strong> Can build wait queues, configure service prefixes, map counter desks, and view analytics.</p>
                      <p>• <strong className="text-foreground font-mono">Staff:</strong> Frontline workers who can only log into their assigned counter desk at <code className="bg-card px-1.5 py-0.5 rounded">/org/[slug]/counter</code> to call tickets.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-foreground text-base">Page Screen UI Replica · Workspace & Members</h3>
                <div className="bg-surface-container/60 border border-border rounded-2xl p-5 space-y-4 shadow-sm text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">City Health Clinic</h4>
                        <p className="text-xs text-muted-foreground font-mono">Workspace Slug: health-clinic</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">Active</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span>Workspace Members (3)</span>
                      <Button size="sm" variant="outline" className="h-7 text-[11px] font-bold gap-1">
                        <Plus className="h-3 w-3" /> Invite Member
                      </Button>
                    </div>

                    {[
                      { name: "Dr. Alex Mercer", email: "alex@clinic.org", role: "Owner" },
                      { name: "Sarah Jenkins", email: "sarah@clinic.org", role: "Admin" },
                      { name: "Michael Chen", email: "michael@clinic.org", role: "Staff" },
                    ].map((m) => (
                      <div key={m.email} className="p-3 bg-card border border-border rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-foreground">{m.name}</div>
                          <div className="text-[10px] text-muted-foreground">{m.email}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-container text-foreground">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: QUEUES & SERVICES */}
          {activeSection === "step2" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-3 border-b border-border pb-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    STEP 2 OF 5
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">URL: /dashboard/organizations/[slug]/queues</span>
                </div>
                <h2 className="text-2xl font-extrabold text-foreground">
                  Step 2: Create Wait Queues & Service Letter Prefixes
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A <strong>Queue</strong> is a waiting department (like <em>Main Reception</em> or <em>Pharmacy</em>). Inside each queue, you add <strong>Services</strong> (like <em>General Consultations</em>) that own single-letter ticket prefixes (<code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono font-bold">A</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono font-bold">B</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono font-bold">C</code>).
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle className="h-4 w-4" /> What You Can Do (Supported)
                  </div>
                  <ul className="space-y-1 text-muted-foreground leading-relaxed">
                    <li>• Create up to 3 active wait queues per organization workspace.</li>
                    <li>• Set 4-digit PIN Passcodes to protect VIP or internal staff queues.</li>
                    <li>• Assign single-letter ticket code prefixes to Services (<code className="bg-muted px-1 py-0.5 rounded text-[10px]">A-001</code>, <code className="bg-muted px-1 py-0.5 rounded text-[10px]">B-001</code>).</li>
                    <li>• Set estimated service duration times for customer wait calculations.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                    <XCircle className="h-4 w-4" /> System Limitations
                  </div>
                  <ul className="space-y-1 text-muted-foreground leading-relaxed">
                    <li>• Multi-letter prefixes (e.g. <code className="bg-muted px-1 py-0.5 rounded text-[10px]">REC-001</code>) are not supported; prefixes must be 1 uppercase letter (`A`-`Z`).</li>
                    <li>• Maximum limit of 3 queues per workspace account.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-primary" /> How to Use the UI Screen (Step-by-Step Guide)
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">1</span>
                      How to Open Queues Page in Left Sidebar
                    </div>
                    <p className="pl-8 text-xs">
                      In your admin sidebar menu on the left, click <strong>Queues</strong> under your organization name (or go to <code className="bg-card px-1.5 py-0.5 rounded">.../queues</code>).
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">2</span>
                      Click "+ Create Queue" Top-Right Button
                    </div>
                    <p className="pl-8 text-xs">
                      Click the top-right <strong className="text-foreground">+ Create Queue</strong> button to open the modal pop-up. Type the <strong>Queue Name</strong> (e.g. <em>Main Outpatient Reception</em>) and optional 4-digit <strong>PIN Passcode</strong> if it's a VIP queue.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">3</span>
                      Adding Services & Assigning Letter Prefixes
                    </div>
                    <p className="pl-8 text-xs">
                      Inside the queue settings, add your service category (e.g. <em>General Consultations</em>) and type its 1-letter code <strong>`prefix`</strong> (e.g. <code className="bg-card px-1.5 py-0.5 rounded font-mono">A</code>). That's how tickets get generated as <code className="bg-card px-1.5 py-0.5 rounded font-mono font-bold">A-001</code>!
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-foreground text-base">Page Screen UI Replica · Queue & Service Builder</h3>
                <div className="bg-surface-container/60 border border-border rounded-2xl p-5 space-y-4 shadow-sm text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h4 className="font-bold text-foreground text-sm">Main Reception Queue</h4>
                      <p className="text-xs text-muted-foreground">2 Services Configured • Public Entry Container</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      Public Entry
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-foreground">Services List (Prefix Owners)</div>
                    {[
                      { prefix: "A", name: "General Consultations", est: "5 mins avg", code: "A-001 -> A-999" },
                      { prefix: "B", name: "Pharmacy & Release", est: "3 mins avg", code: "B-001 -> B-999" },
                    ].map((s) => (
                      <div key={s.prefix} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs">
                            {s.prefix}
                          </span>
                          <div>
                            <div className="font-bold text-foreground">{s.name}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                              <Clock className="h-3 w-3" /> {s.est}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          Service Prefix: {s.prefix}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: COUNTERS & STAFF MAPPING */}
          {activeSection === "step3" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-3 border-b border-border pb-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    STEP 3 OF 5
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">URL: /dashboard/organizations/[slug]/assignments</span>
                </div>
                <h2 className="text-2xl font-extrabold text-foreground">
                  Step 3: Set Up Counter Desks & Assign Staff Members
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>Counters</strong> are the physical desks or windows where staff sit. On the <strong>Staff Assignments</strong> page, admins check boxes to map which desks each staff member operates.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle className="h-4 w-4" /> What You Can Do (Supported)
                  </div>
                  <ul className="space-y-1 text-muted-foreground leading-relaxed">
                    <li>• <strong>Multi-Service Desks:</strong> A single desk (Desk 1) can handle multiple services (Service A & B simultaneously).</li>
                    <li>• <strong>Multi-Staff Load Balancing:</strong> Multiple staff members can serve the same service category at the same time.</li>
                    <li>• <strong>1-Click Checkbox Matrix:</strong> Easily toggle staff desk assignments on or off from a central screen.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                    <XCircle className="h-4 w-4" /> System Limitations
                  </div>
                  <ul className="space-y-1 text-muted-foreground leading-relaxed">
                    <li>• A staff worker operates one active desk console at a time during their shift.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-primary" /> How to Use the UI Screen (Step-by-Step Guide)
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">1</span>
                      How to Open Staff Assignments Page
                    </div>
                    <p className="pl-8 text-xs">
                      Click <strong>Assignments</strong> in your left sidebar menu (or navigate to <code className="bg-card px-1.5 py-0.5 rounded">.../assignments</code>).
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">2</span>
                      Select Staff Member Dropdown
                    </div>
                    <p className="pl-8 text-xs">
                      At the top of the screen, click the <strong>Staff Dropdown Menu</strong> and choose the team member you want to assign (e.g. <em>Sarah Jenkins</em>).
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">3</span>
                      Click Checkbox Next to Desk
                    </div>
                    <p className="pl-8 text-xs">
                      Click the checkbox next to physical desks (e.g. <em>Desk 1</em>, <em>Window 2</em>). A green checkmark appears instantly saving their desk assignment!
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-foreground text-base">Page Screen UI Replica · Staff Assignment Matrix</h3>
                <div className="bg-surface-container/60 border border-border rounded-2xl p-5 space-y-4 shadow-sm text-xs">
                  <div className="flex items-center justify-between font-bold text-foreground border-b border-border pb-3">
                    <span>Staff Counter Assignment Matrix</span>
                    <span className="text-xs text-muted-foreground font-normal">2 Active Counters</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { counter: "Counter 1 (Main Reception)", staff: "Sarah Jenkins (Admin)", services: "Service A & B (Multi-Service Mapped)" },
                      { counter: "Counter 2 (Main Reception)", staff: "Michael Chen (Staff)", services: "Service A (Consultations Only)" },
                    ].map((a) => (
                      <div key={a.counter} className="bg-card border border-border rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between font-bold text-foreground text-sm">
                          <span className="flex items-center gap-2"><Ticket className="h-4 w-4 text-primary" /> {a.counter}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">{a.staff}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground pl-6">
                          <strong>Active Services Mapped:</strong> {a.services}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: KIOSK & TV DISPLAY */}
          {activeSection === "step4" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-3 border-b border-border pb-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    STEP 4 OF 5
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">URL: /live/[queueId] & /display/[queueId]</span>
                </div>
                <h2 className="text-2xl font-extrabold text-foreground">
                  Step 4: Launch Entrance Kiosks & Lounge TV Display Screens
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Open the public <strong>Entrance Kiosk</strong> on a front-door tablet for visitor check-in, and open the <strong>Lounge TV Display</strong> on a waiting room monitor for audio ticket calls.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle className="h-4 w-4" /> What You Can Do (Supported)
                  </div>
                  <ul className="space-y-1 text-muted-foreground leading-relaxed">
                    <li>• Touchscreen check-in kiosk tablet link (<code className="bg-muted px-1 py-0.5 rounded text-[10px]">/live/[queueId]</code>).</li>
                    <li>• Mobile QR code live queue tracking on customer phones.</li>
                    <li>• Fullscreen lounge TV display monitor (<code className="bg-muted px-1 py-0.5 rounded text-[10px]">.../display/[queueId]</code>).</li>
                    <li>• Automatic chime sound alerts on ticket calls.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                    <XCircle className="h-4 w-4" /> System Limitations
                  </div>
                  <ul className="space-y-1 text-muted-foreground leading-relaxed">
                    <li>• HiQueue is 100% digital; physical paper thermal printers are not required.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-primary" /> How to Launch Screens from the UI
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">1</span>
                      Launching Entrance Kiosk on Tablet
                    </div>
                    <p className="pl-8 text-xs">
                      Go to the <strong>Queues</strong> page. On any queue card, click the <strong className="text-foreground">View Kiosk</strong> button. Put your tablet browser in full-screen mode at your front entrance!
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">2</span>
                      Launching Lounge TV Monitor Screen
                    </div>
                    <p className="pl-8 text-xs">
                      On the same queue card, click the <strong className="text-foreground">View TV Display</strong> button. Open this link on your Smart TV or lounge computer monitor to broadcast ticket chime calls!
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-foreground text-base">Page Screen UI Replicas · Kiosk & TV Display</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-surface-container/60 border border-border rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-primary" /> Touch Kiosk View
                      </span>
                      <span className="text-[10px] text-muted-foreground">Entrance Tablet</span>
                    </div>
                    <div className="p-4 bg-card border border-border rounded-xl text-center space-y-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Issued Ticket</span>
                      <div className="text-3xl font-black text-primary font-mono">A-015</div>
                      <div className="text-[10px] text-muted-foreground">2 people ahead of you</div>
                      <div className="pt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-primary">
                        <QrCode className="h-3.5 w-3.5" /> Scan QR Code
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container/60 border border-border rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Tv className="h-3.5 w-3.5 text-primary" /> Lounge TV Screen
                      </span>
                      <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                        <Volume2 className="h-3.5 w-3.5" /> Chime Active
                      </span>
                    </div>
                    <div className="p-4 bg-card border-2 border-primary/40 rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-primary">NOW SERVING</span>
                      <div className="text-3xl font-black text-foreground font-mono">A-014</div>
                      <div className="text-xs font-bold text-primary">Proceed to Counter 2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DAILY CALLING CONSOLE */}
          {activeSection === "step5" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-3 border-b border-border pb-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    STEP 5 OF 5
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">URL: /org/[slug]/counter</span>
                </div>
                <h2 className="text-2xl font-extrabold text-foreground">
                  Step 5: Daily Operations & Staff Ticket Calling Console
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  During work shifts, staff members log into their counter desk console to call, hold, recall, and complete customer tickets.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle className="h-4 w-4" /> Console Action Buttons
                  </div>
                  <ul className="space-y-1 text-muted-foreground leading-relaxed">
                    <li>• <strong>Call Next:</strong> Pulls next waiting ticket and sounds TV chime.</li>
                    <li>• <strong>Recall Chime:</strong> Re-plays chime alert on lounge TV screen.</li>
                    <li>• <strong>Hold Ticket:</strong> Pauses ticket if customer stepped away.</li>
                    <li>• <strong>Recall from Hold:</strong> Resumes serving a held ticket.</li>
                    <li>• <strong>Complete:</strong> Marks service completed & logs handle time.</li>
                    <li>• <strong>No-Show / Skip:</strong> Advances line if customer walked away.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                    <XCircle className="h-4 w-4" /> System Limitations
                  </div>
                  <ul className="space-y-1 text-muted-foreground leading-relaxed">
                    <li>• Ticket transfers between different queues/departments are not supported; tickets stay in their assigned service queue.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-border">
                <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-primary" /> How Staff Use the Console Screen UI
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">1</span>
                      Logging into Counter Desk
                    </div>
                    <p className="pl-8 text-xs">
                      Staff open <code className="bg-card px-1.5 py-0.5 rounded">/org/[slug]/login</code>, enter their staff login details, select their desk (e.g. <em>Desk 1</em>), and click <strong>Open Calling Console</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">2</span>
                      Click "Call Next" Big Primary Button
                    </div>
                    <p className="pl-8 text-xs">
                      Click the big primary <strong className="text-foreground font-bold">Call Next</strong> button. Ticket <code className="bg-card px-1.5 py-0.5 rounded font-mono font-bold text-primary">A-014</code> pops up on screen, and the lounge TV chimes!
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container/60 border border-border rounded-2xl space-y-2">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-extrabold">3</span>
                      Click "Complete" or "Hold"
                    </div>
                    <p className="pl-8 text-xs">
                      When finished with the customer, click <strong className="text-emerald-600 font-bold">Complete</strong>. If the customer forgot a document and stepped away, click <strong className="text-amber-600 font-bold">Hold</strong> so you can serve others in the meantime!
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-foreground text-base">Page Screen UI Replica · Staff Calling Desk Console</h3>
                <div className="bg-surface-container/60 border border-border rounded-2xl p-5 space-y-4 shadow-sm text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary" /> Counter 2 Console
                    </div>
                    <span className="text-emerald-600 font-bold">Online & Active</span>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-4 shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Now Serving at Counter 2</span>
                    <div className="text-4xl font-extrabold text-foreground font-mono">A-014</div>
                    <div className="text-xs text-muted-foreground">Service: General Consultations</div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
                      <Button
                        size="sm"
                        onClick={() => setCalledTicket({ number: "A-015", counter: "Counter 2" })}
                        className="bg-primary text-primary-foreground font-bold rounded-xl gap-1"
                      >
                        <PhoneCall className="h-3.5 w-3.5" /> Call Next
                      </Button>
                      <Button size="sm" variant="outline" className="font-bold rounded-xl gap-1">
                        <RefreshCw className="h-3.5 w-3.5" /> Recall Chime
                      </Button>
                      <Button size="sm" variant="secondary" className="font-bold rounded-xl gap-1">
                        <Check className="h-3.5 w-3.5 text-emerald-600" /> Complete
                      </Button>
                      <Button size="sm" variant="ghost" className="text-amber-600 hover:bg-amber-500/10 font-bold rounded-xl gap-1">
                        <Pause className="h-3.5 w-3.5" /> Hold
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 font-bold rounded-xl gap-1">
                        <UserX className="h-3.5 w-3.5" /> No-Show
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS & PORTAL CUSTOMIZATION - EXPANDED WITH PLAIN ENGLISH & SYSTEM UI GUIDES */}
          {activeSection === "analytics" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-3 border-b border-border pb-5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  ANALYTICS & CUSTOM BRANDING
                </span>
                <h2 className="text-2xl font-extrabold text-foreground">
                  Performance Reports & Portal Branding Customization
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Monitor live queue health metrics, track individual staff desk efficiency, and customize your portal branding to match your company colors.
                </p>
              </div>

              {/* 1. Analytics Section */}
              <div className="p-6 rounded-3xl bg-surface-container/60 border border-border space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="font-extrabold text-foreground text-base sm:text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" /> 1. Analytics & Reports Dashboard
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-card border border-border text-foreground">
                    URL: /dashboard/analytics
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground">What it does:</strong> Gives business managers full visibility into daily wait times, customer volume surges, and staff productivity leaderboard statistics.
                  </p>

                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-foreground text-xs uppercase tracking-wider">How to Navigate & Read Analytics UI:</div>
                    <div className="p-3.5 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs flex items-center gap-2">
                        <MousePointerClick className="h-3.5 w-3.5 text-primary" /> Step A: Click "Analytics" in Left Sidebar Menu
                      </div>
                      <p className="text-xs">In your main dashboard sidebar on the left, click <strong>Analytics</strong> (or navigate to <code className="bg-muted px-1.5 py-0.5 rounded">/dashboard/analytics</code>).</p>
                    </div>

                    <div className="p-3.5 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" /> Step B: Review Real-Time Key Performance Cards
                      </div>
                      <div className="text-xs space-y-1 pl-5">
                        <p>• <strong className="text-foreground">Total Tickets Issued:</strong> Counts all visitors who checked in today across queues.</p>
                        <p>• <strong className="text-foreground">Average Wait Time:</strong> Shows how long customers wait in the lounge before their ticket is called.</p>
                        <p>• <strong className="text-foreground">Average Handling Time:</strong> Measures how long staff take to complete each customer transaction.</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-primary" /> Step C: Staff Productivity Leaderboard
                      </div>
                      <p className="text-xs">Scroll down to the <strong>Staff Desk Reports</strong> table to view total tickets completed, total holds, and average handle times per staff member during their shift.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Portal Customization & Themes */}
              <div className="p-6 rounded-3xl bg-surface-container/60 border border-border space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="font-extrabold text-foreground text-base sm:text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" /> 2. Custom Portal Branding & Theme Settings
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-card border border-border text-foreground">
                    URL: .../portal
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground">What it does:</strong> Allows admins to brand customer kiosks, lounge TV screens, and staff portals with custom color schemes and logo headers.
                  </p>

                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-foreground text-xs uppercase tracking-wider">How to Customize Portal UI:</div>
                    <div className="p-3.5 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs flex items-center gap-2">
                        <MousePointerClick className="h-3.5 w-3.5 text-primary" /> Step A: Open Portal Customization Page
                      </div>
                      <p className="text-xs">Click <strong>Portal Customization</strong> under your workspace in the left sidebar menu (or navigate to <code className="bg-muted px-1.5 py-0.5 rounded">/dashboard/organizations/[slug]/portal</code>).</p>
                    </div>

                    <div className="p-3.5 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs flex items-center gap-2">
                        <Palette className="h-3.5 w-3.5 text-primary" /> Step B: Select Preset Color Themes
                      </div>
                      <div className="text-xs space-y-1 pl-5">
                        <p>• <strong className="text-emerald-600 font-bold">Forest Emerald:</strong> Clean medical & eco-friendly green theme.</p>
                        <p>• <strong className="text-blue-600 font-bold">Ocean Blue:</strong> Modern corporate & banking blue palette.</p>
                        <p>• <strong className="text-amber-600 font-bold">Warm Amber:</strong> Premium hospitality & VIP lounge aesthetic.</p>
                        <p>• <strong className="text-foreground font-bold">Midnight Dark:</strong> Sleek dark mode for lounge monitors.</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-card border border-border rounded-2xl space-y-1">
                      <div className="font-bold text-foreground text-xs flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-primary" /> Step C: Click "Save Branding Changes"
                      </div>
                      <p className="text-xs">Click the primary <strong>Save Theme Changes</strong> button. All entrance kiosks, staff consoles, and lounge TV screens update immediately!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMPREHENSIVE TECHNICAL FAQ KNOWLEDGE BASE - EXPANDED WITH PLAIN ENGLISH DETAILED OPERATIONAL SCENARIOS */}
          {activeSection === "faq" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-3 border-b border-border pb-5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  KNOWLEDGE BASE & FAQ
                </span>
                <h2 className="text-2xl font-extrabold text-foreground">
                  Frequently Asked Questions & Operational Scenarios
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Plain-English answers to critical questions about ticket numbering, daily resets, concurrency locks, internet drops, holds, and passcodes.
                </p>
              </div>

              <div className="space-y-6 text-xs sm:text-sm">
                {/* 1. Ticket Number Sequence Rules */}
                <div className="p-6 rounded-3xl bg-surface-container/60 border border-border space-y-2 shadow-sm">
                  <div className="font-extrabold text-foreground text-base flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary shrink-0" /> 1. How do ticket numbers work? Do they reset every day?
                  </div>
                  <div className="text-muted-foreground leading-relaxed pl-7 space-y-2 text-xs sm:text-sm">
                    <p>
                      Every ticket number consists of a <strong>Service Letter Prefix</strong> (owned by the Service) followed by a 3-digit sequential number — for example, <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-primary">A-001</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-primary">A-002</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-primary">A-003</code>.
                    </p>
                    <p>
                      <strong className="text-foreground">Automatic Midnight Reset:</strong> Yes! Every new business day at 12:00 AM, ticket sequences automatically reset back to <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold">001</code> so your team starts fresh each morning.
                    </p>
                  </div>
                </div>

                {/* 2. Staff Concurrency & Race Conditions */}
                <div className="p-6 rounded-3xl bg-surface-container/60 border border-border space-y-2 shadow-sm">
                  <div className="font-extrabold text-foreground text-base flex items-center gap-2">
                    <Shuffle className="h-5 w-5 text-primary shrink-0" /> 2. What if two staff members click "Call Next" at the exact same millisecond?
                  </div>
                  <div className="text-muted-foreground leading-relaxed pl-7 space-y-2 text-xs sm:text-sm">
                    <p>
                      HiQueue uses <strong>PostgreSQL Atomic Row Transactions</strong> to prevent double-calling errors.
                    </p>
                    <p>
                      Whichever staff click reaches the server first receives the ticket (e.g. <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold">A-014</code>) and locks it to Desk 1. The second staff click is automatically assigned the next waiting ticket in line (<code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold">A-015</code>) for Desk 2. No duplicate calls ever occur!
                    </p>
                  </div>
                </div>

                {/* 3. Offline Resilience */}
                <div className="p-6 rounded-3xl bg-surface-container/60 border border-border space-y-2 shadow-sm">
                  <div className="font-extrabold text-foreground text-base flex items-center gap-2">
                    <WifiOff className="h-5 w-5 text-primary shrink-0" /> 3. What happens if Wi-Fi drops or disconnects briefly?
                  </div>
                  <div className="text-muted-foreground leading-relaxed pl-7 space-y-2 text-xs sm:text-sm">
                    <p>
                      Both the Staff Console and Lounge TV Display feature <strong>Automatic Reconnect Handlers</strong>.
                    </p>
                    <p>
                      If internet drops for a few seconds, the screen automatically attempts reconnection in the background. As soon as Wi-Fi returns, the display syncs with the database state — no manual browser page refresh needed!
                    </p>
                  </div>
                </div>

                {/* 4. Ticket Hold Action */}
                <div className="p-6 rounded-3xl bg-surface-container/60 border border-border space-y-2 shadow-sm">
                  <div className="font-extrabold text-foreground text-base flex items-center gap-2">
                    <Pause className="h-5 w-5 text-primary shrink-0" /> 4. What if a customer needs to step away temporarily (e.g. forgot ID)?
                  </div>
                  <div className="text-muted-foreground leading-relaxed pl-7 space-y-2 text-xs sm:text-sm">
                    <p>
                      Staff simply click the <strong className="text-amber-600 font-bold">Hold</strong> button on their console. This moves the ticket into an "On Hold" list and lets staff call the next person in line.
                    </p>
                    <p>
                      When the customer returns 5 minutes later, staff click <strong className="text-primary font-bold">Recall from Hold</strong> to resume serving them without forcing them to get a brand new ticket!
                    </p>
                  </div>
                </div>

                {/* 5. PIN Passcodes & Security */}
                <div className="p-6 rounded-3xl bg-surface-container/60 border border-border space-y-2 shadow-sm">
                  <div className="font-extrabold text-foreground text-base flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary shrink-0" /> 5. How do PIN Passcode protected queues work?
                  </div>
                  <div className="text-muted-foreground leading-relaxed pl-7 space-y-2 text-xs sm:text-sm">
                    <p>
                      Admins can set a 4-digit PIN (e.g. <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold">8888</code>) on restricted or VIP queues.
                    </p>
                    <p>
                      When a visitor taps that queue on the entrance kiosk tablet, the screen prompts them to enter the 4-digit PIN before issuing a ticket. This prevents unauthorized visitors from joining VIP or staff-only queues.
                    </p>
                  </div>
                </div>

                {/* 6. Multi-Service Counter Dispatching */}
                <div className="p-6 rounded-3xl bg-surface-container/60 border border-border space-y-2 shadow-sm">
                  <div className="font-extrabold text-foreground text-base flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary shrink-0" /> 6. How does a single desk handle multiple services at once?
                  </div>
                  <div className="text-muted-foreground leading-relaxed pl-7 space-y-2 text-xs sm:text-sm">
                    <p>
                      When a desk is mapped to serve both <strong>Service A (Consultations)</strong> and <strong>Service B (Vitals)</strong>, clicking <strong>Call Next</strong> queries all unserved tickets across both services.
                    </p>
                    <p>
                      HiQueue automatically selects the oldest waiting ticket regardless of prefix, ensuring fair first-come, first-served customer treatment across all mapped categories.
                    </p>
                  </div>
                </div>

                {/* 7. Digital Mobile QR Tracking */}
                <div className="p-6 rounded-3xl bg-surface-container/60 border border-border space-y-2 shadow-sm">
                  <div className="font-extrabold text-foreground text-base flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary shrink-0" /> 7. How do customers track line position on their phones?
                  </div>
                  <div className="text-muted-foreground leading-relaxed pl-7 space-y-2 text-xs sm:text-sm">
                    <p>
                      When the kiosk issues a ticket, it displays a custom QR code on screen.
                    </p>
                    <p>
                      Visitors point their phone camera at the QR code to open a live queue tracker on their mobile web browser. It shows their live place in line and turns green when their ticket is called — no app download required!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
