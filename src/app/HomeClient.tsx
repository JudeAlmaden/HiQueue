"use client"

import { useState } from "react"
import Link from "next/link"
import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  LayoutDashboard,
  BookOpen,
  Smartphone,
  Tv,
  PhoneCall,
  Volume2,
  Check,
  Pause,
  QrCode,
  Clock,
  BarChart3,
  Layers,
} from "lucide-react"

interface HomeClientProps {
  isLoggedIn: boolean
}

interface CalledTicket {
  number: string
  counter: string
  service: string
}

interface KioskIssued {
  number: string
  service: string
  position: number
}

const SERVICES = [
  { prefix: "A", name: "General Consultations", highlight: "bg-primary/10 text-primary border-primary/30" },
  { prefix: "B", name: "Triage & Vitals", highlight: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  { prefix: "C", name: "Pharmacy & Release", highlight: "bg-purple-500/10 text-purple-600 border-purple-200" },
]

const COUNTERS = [
  { id: "desk1", name: "Desk 1", services: ["A", "B"], staff: "Sarah J." },
  { id: "desk2", name: "Desk 2", services: ["A"], staff: "Michael C." },
  { id: "window1", name: "Window 1", services: ["B", "C"], staff: "Emily R." },
]

const HOURLY_DATA = [
  { hour: "8AM", count: 12 },
  { hour: "9AM", count: 28 },
  { hour: "10AM", count: 52 },
  { hour: "11AM", count: 47 },
  { hour: "12PM", count: 35 },
  { hour: "1PM", count: 29 },
  { hour: "2PM", count: 58 },
  { hour: "3PM", count: 43 },
  { hour: "4PM", count: 31 },
  { hour: "5PM", count: 15 },
]
const MAX_COUNT = Math.max(...HOURLY_DATA.map((d) => d.count))

const STAFF_LEADERBOARD = [
  { name: "Emily R.", tickets: 52, avg: "3m 41s" },
  { name: "Sarah J.", tickets: 47, avg: "4m 12s" },
  { name: "Michael C.", tickets: 41, avg: "5m 02s" },
]

export function HomeClient({ isLoggedIn }: HomeClientProps) {
  // ─── Section A: Kiosk ───────────────────────────────────────────
  const [kioskSeq, setKioskSeq] = useState(14)
  const [kioskIssued, setKioskIssued] = useState<KioskIssued | null>(null)

  // ─── Sections B + C: shared console ↔ TV state ──────────────────
  const [waitingQueue, setWaitingQueue] = useState<string[]>(["A-015", "A-016", "B-001", "A-017"])
  const [calledTicket, setCalledTicket] = useState<CalledTicket | null>({
    number: "A-013",
    counter: "Desk 1",
    service: "General Consultations",
  })
  const [heldTickets, setHeldTickets] = useState<string[]>([])
  const [recentlyCalled, setRecentlyCalled] = useState<string[]>(["A-011", "A-012"])
  const [tvPulse, setTvPulse] = useState(false)
  const [consoleFlash, setConsoleFlash] = useState(false)

  // ─── Section D: routing diagram ──────────────────────────────────
  const [selectedCounter, setSelectedCounter] = useState<string>("desk1")

  // ─── Handlers ────────────────────────────────────────────────────
  const handleKioskTap = (service: string, prefix: string) => {
    if (kioskIssued) return
    const nextSeq = kioskSeq + 1
    setKioskSeq(nextSeq)
    const ticketNum = `${prefix}-${String(nextSeq).padStart(3, "0")}`
    setKioskIssued({ number: ticketNum, service, position: Math.floor(Math.random() * 5) + 1 })
    setWaitingQueue((prev) => [...prev, ticketNum])
    setTimeout(() => setKioskIssued(null), 4000)
  }

  const handleCallNext = () => {
    const next = waitingQueue[0]
    if (!next) return
    if (calledTicket) {
      setRecentlyCalled((prev) => [...prev.slice(-2), calledTicket.number])
    }
    setWaitingQueue((prev) => prev.slice(1))
    const svc = next.startsWith("B") ? "Triage & Vitals" : "General Consultations"
    setCalledTicket({ number: next, counter: "Desk 1", service: svc })
    setTvPulse(true)
    setConsoleFlash(true)
    setTimeout(() => {
      setTvPulse(false)
      setConsoleFlash(false)
    }, 1200)
  }

  const handleComplete = () => {
    if (!calledTicket) return
    setRecentlyCalled((prev) => [...prev.slice(-2), calledTicket.number])
    setCalledTicket(null)
  }

  const handleHold = () => {
    if (!calledTicket) return
    setHeldTickets((prev) => [...prev, calledTicket.number])
    setCalledTicket(null)
  }

  const selectedCounterData = COUNTERS.find((c) => c.id === selectedCounter)
  const highlightedServices = selectedCounterData?.services ?? []

  // ─── QR code grid pattern (static visual) ────────────────────────
  const QR_CELLS = [0, 1, 2, 3, 5, 9, 10, 11, 14, 15, 20, 21, 22, 23, 24, 6, 12, 18, 7, 17]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">

      {/* ─── NAV ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <Link href="/features">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              Features & Guide
            </Button>
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5 font-bold">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ─── HERO — USER'S ORIGINAL, UNTOUCHED ───────────────────────── */}
      <div className="relative flex-1 overflow-hidden border-b border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
        />
        <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24 gap-6 max-w-3xl mx-auto w-full h-full">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
            ✦ Queue management, simplified
          </span>
          <h1
            className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight text-foreground"
            style={{ letterSpacing: "-0.03em" }}
          >
            Serve people better,<br />one ticket at a time.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            HiQueue helps businesses manage walk-in queues, issue tickets, and call customers — without the chaos.
          </p>
          <div className="flex items-center gap-3 mt-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="rounded-full px-6 gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="rounded-full px-6 gap-2">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="rounded-full px-6">
                    Sign in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </main>
      </div>

      {/* ─── SECTION A: THE KIOSK MOMENT ────────────────────────────── */}
      <section className="py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Text left */}
          <div className="space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <Smartphone className="h-3.5 w-3.5" /> ENTRANCE KIOSK
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              No app.<br />No form.<br />No friction.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              Visitors walk in, tap their service on any tablet you already own, and get a numbered ticket with a live QR tracking link — in under 3 seconds.
            </p>
          </div>

          {/* Kiosk widget right */}
          <div className="relative">
            <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-lg space-y-5 max-w-sm mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-sm font-bold text-foreground">City Health Clinic</span>
                <span className="text-xs text-muted-foreground font-mono">Main Reception</span>
              </div>

              {kioskIssued ? (
                /* — Ticket issued state — */
                <div className="text-center space-y-4 py-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Ticket</div>
                  <div className="text-6xl font-black text-primary font-mono">{kioskIssued.number}</div>
                  <div className="text-xs text-muted-foreground">{kioskIssued.service}</div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {kioskIssued.position} {kioskIssued.position === 1 ? "person" : "people"} ahead of you
                  </div>
                  {/* Simulated QR code grid */}
                  <div className="mx-auto w-16 h-16 grid grid-cols-5 gap-px p-1.5 bg-muted rounded-xl">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-[1px] ${QR_CELLS.includes(i) ? "bg-foreground" : "bg-background"}`}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <QrCode className="h-3 w-3" /> Scan to track on your phone
                  </div>
                </div>
              ) : (
                /* — Service selection state — */
                <div className="space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Select Your Service:
                  </div>
                  {[
                    { service: "General Consultations", prefix: "A" },
                    { service: "Triage & Vitals", prefix: "B" },
                    { service: "Pharmacy & Release", prefix: "C" },
                  ].map(({ service, prefix }) => (
                    <button
                      key={prefix}
                      onClick={() => handleKioskTap(service, prefix)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 active:scale-[0.98] transition-all duration-150 group"
                    >
                      <span className="font-semibold text-foreground text-sm">{service}</span>
                      <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded group-hover:bg-primary/20 transition-colors">
                        Prefix {prefix}
                      </span>
                    </button>
                  ))}
                  <p className="text-[10px] text-center text-muted-foreground pt-1">
                    ↑ Tap a service to issue a ticket
                  </p>
                </div>
              )}
            </div>
            <div className="absolute inset-0 -z-10 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ─── SECTION B: THE CALLING MOMENT ─────────────────────────── */}
      <section className="py-24 px-6 border-b border-border bg-surface-container/30">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Console widget left */}
          <div className="relative order-last lg:order-first">
            <div
              className={`bg-card border-2 rounded-3xl p-6 shadow-lg space-y-5 max-w-sm mx-auto transition-all duration-300 ${
                consoleFlash ? "border-primary shadow-primary/20 shadow-xl" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <PhoneCall className="h-4 w-4 text-primary" /> Desk 1 Console
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>

              {/* Ticket display */}
              <div className="p-5 bg-surface-container/60 rounded-2xl text-center space-y-1 border border-border">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Now Serving</div>
                <div
                  className={`text-5xl font-black font-mono transition-all duration-300 ${
                    calledTicket ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {calledTicket?.number ?? "- - -"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {calledTicket?.service ?? "No ticket active"}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleCallNext}
                  disabled={waitingQueue.length === 0}
                  className="w-full h-11 rounded-2xl font-bold gap-2"
                >
                  <PhoneCall className="h-4 w-4" />
                  Call Next{waitingQueue.length > 0 ? ` (${waitingQueue.length} waiting)` : ""}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleComplete}
                    disabled={!calledTicket}
                    variant="outline"
                    className="rounded-xl font-bold gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-500/10 hover:border-emerald-400 disabled:opacity-40"
                  >
                    <Check className="h-3.5 w-3.5" /> Complete
                  </Button>
                  <Button
                    onClick={handleHold}
                    disabled={!calledTicket}
                    variant="ghost"
                    className="rounded-xl font-bold gap-1.5 text-amber-600 hover:bg-amber-500/10 disabled:opacity-40"
                  >
                    <Pause className="h-3.5 w-3.5" /> Hold
                  </Button>
                </div>
              </div>

              {heldTickets.length > 0 && (
                <div className="flex items-center justify-between p-2.5 bg-amber-500/10 rounded-xl border border-amber-200/50 text-xs">
                  <span className="font-bold text-amber-600">On Hold:</span>
                  <span className="font-mono font-bold text-amber-600">{heldTickets.join(", ")}</span>
                </div>
              )}

              {consoleFlash && (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-200/50 text-xs text-emerald-600 font-bold">
                  <Volume2 className="h-3.5 w-3.5" /> Lounge TV updated ✓
                </div>
              )}
            </div>
            <div className="absolute inset-0 -z-10 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
          </div>

          {/* Text right */}
          <div className="space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <PhoneCall className="h-3.5 w-3.5" /> STAFF CONSOLE
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              One click.<br />The whole room<br />hears it.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              Staff hit <strong className="text-foreground">Call Next</strong>. HiQueue locks the ticket in PostgreSQL, flashes the lounge TV, and chimes — in a single atomic action. No double-calls. No race conditions. Try the console on the left.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION C: THE LOUNGE TV MOMENT ───────────────────────── */}
      <section className="py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Text left */}
          <div className="space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <Tv className="h-3.5 w-3.5" /> LOUNGE TV DISPLAY
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Every seat in<br />the room knows<br />their turn.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              Mount any Smart TV or extra monitor as your queue board. Open the URL, go fullscreen — done. The screen on the right updates live from the console above.
            </p>
            <div className="inline-flex items-center gap-2 p-3.5 bg-surface-container/60 border border-border rounded-2xl text-xs">
              <span className="font-mono font-bold text-primary">/org/city-clinic/display/reception</span>
              <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold shrink-0">LIVE URL</span>
            </div>
          </div>

          {/* TV widget right — reacts to shared calledTicket state */}
          <div className="relative">
            <div
              className={`bg-foreground rounded-3xl p-8 shadow-2xl max-w-sm mx-auto transition-all duration-500 ${
                tvPulse ? "ring-4 ring-primary ring-offset-2 ring-offset-background scale-[1.01]" : ""
              }`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-background/50 uppercase tracking-widest">
                    HiQueue · City Clinic
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>

                {/* Main display */}
                <div
                  className={`text-center space-y-2 py-6 rounded-2xl border-2 transition-all duration-500 ${
                    tvPulse
                      ? "border-primary/60 bg-primary/10"
                      : "border-background/20 bg-background/10"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-background/50">Now Serving</div>
                  <div
                    className={`text-6xl font-black font-mono transition-all duration-300 ${
                      calledTicket ? "text-background" : "text-background/25"
                    }`}
                  >
                    {calledTicket?.number ?? "- - -"}
                  </div>
                  <div
                    className={`text-sm font-bold transition-colors duration-300 ${
                      calledTicket ? "text-primary" : "text-background/25"
                    }`}
                  >
                    {calledTicket ? `→ Proceed to ${calledTicket.counter}` : "Waiting for next call..."}
                  </div>
                </div>

                {/* Recently served */}
                {recentlyCalled.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-background/35">
                      Recently Called
                    </div>
                    {recentlyCalled.slice(-3).map((n) => (
                      <div key={n} className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-background/10">
                        <span className="font-mono font-bold text-background/50 text-xs">{n}</span>
                        <span className="text-[9px] text-background/35">✓ Served</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="absolute inset-0 -z-10 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ─── SECTION D: THE ROUTING MOMENT ─────────────────────────── */}
      <section className="py-24 px-6 border-b border-border bg-surface-container/30">
        <div className="max-w-5xl mx-auto space-y-14">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <Layers className="h-3.5 w-3.5" /> MULTI-SERVICE ROUTING
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              One desk.<br />Every service.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Counters aren&apos;t locked to one queue. Map Desk 1 to handle Consultations and Triage simultaneously — tickets are dispatched by arrival order. Click a counter to see its coverage.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Services */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Services (Ticket Prefixes)
              </div>
              {SERVICES.map((s) => (
                <div
                  key={s.prefix}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                    highlightedServices.includes(s.prefix)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">{s.name}</span>
                    <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg border ${s.highlight}`}>
                      {s.prefix}
                    </span>
                  </div>
                  {highlightedServices.includes(s.prefix) && (
                    <div className="mt-1.5 text-[10px] text-primary font-bold">
                      ✓ Served by {selectedCounterData?.name}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Center bridge */}
            <div className="hidden lg:flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-px h-12 bg-border" />
                <div className="p-3 rounded-2xl bg-card border border-border shadow-sm">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div className="text-[9px] font-bold text-muted-foreground text-center uppercase tracking-wider">
                  Counter<br />Service<br />Mapping
                </div>
                <div className="w-px h-12 bg-border" />
              </div>
            </div>

            {/* Counters */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Physical Desks (Click to Inspect)
              </div>
              {COUNTERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCounter(c.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    selectedCounter === c.id
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground">{c.staff}</span>
                  </div>
                  <div className="mt-1.5 flex items-center flex-wrap gap-1">
                    {c.services.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                      >
                        {s}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground">handles</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION E: THE ANALYTICS MOMENT ───────────────────────── */}
      <section className="py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Text left */}
          <div className="space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <BarChart3 className="h-3.5 w-3.5" /> ANALYTICS
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Know when<br />your peak is.<br />Fix it before<br />it breaks.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              Real-time ticket volume, average wait times, and per-staff productivity — from your admin dashboard the moment the day starts.
            </p>
          </div>

          {/* Analytics widget right */}
          <div className="relative">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-lg space-y-5 max-w-sm mx-auto">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Today", value: "147", sub: "tickets" },
                  { label: "Avg Wait", value: "4m 12s", sub: "per ticket" },
                  { label: "Top Desk", value: "Desk 1", sub: "52 served" },
                ].map((s) => (
                  <div key={s.label} className="p-3 bg-surface-container/60 rounded-2xl text-center border border-border space-y-0.5">
                    <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</div>
                    <div className="font-extrabold text-foreground text-sm leading-tight">{s.value}</div>
                    <div className="text-[9px] text-muted-foreground">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">Hourly Volume</span>
                  <span className="text-muted-foreground text-[10px]">Today</span>
                </div>
                <div className="flex items-end gap-0.5 h-20">
                  {HOURLY_DATA.map((d) => (
                    <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t transition-all duration-500 ${
                          d.count === MAX_COUNT ? "bg-primary" : "bg-primary/25"
                        }`}
                        style={{ height: `${(d.count / MAX_COUNT) * 100}%` }}
                      />
                      <span className="text-[7px] text-muted-foreground font-mono">{d.hour}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-foreground">Staff Leaderboard</div>
                {STAFF_LEADERBOARD.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container/60 border border-border">
                    <span className={`text-xs font-extrabold w-4 ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                      #{i + 1}
                    </span>
                    <span className="flex-1 text-xs font-semibold text-foreground">{s.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{s.avg}</span>
                    <span className="text-xs font-bold text-primary">{s.tickets}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 -z-10 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ─── OPEN SOURCE — ORIGINAL ──────────────────────────────────── */}
      <section className="border-t border-border px-6 py-16 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5 text-foreground">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Open Source</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            HiQueue is fully open source. Self-host it on your own server, customize it for your business, or contribute to the project.
          </p>
          <a
            href="https://github.com/JudeAlmaden/HiQueue"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </div>
      </section>

      {/* ─── FOOTER — ORIGINAL ───────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HiQueue. All rights reserved.
          </p>
          <a
            href="https://github.com/JudeAlmaden/HiQueue"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Open Source — Self-host it
          </a>
        </div>
      </footer>
    </div>
  )
}
