"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/toast"
import {
  Play,
  CheckCircle,
  Pause,
  UserX,
  SkipForward,
  Clock,
  User,
  Monitor,
  ChevronRight,
  Wifi,
  WifiOff,
  Search,
  Volume2
} from "lucide-react"
import {
  callNextTicketAction,
  callSpecificTicketAction,
  announceCurrentTicketAction,
  completeCurrentTicketAction,
  holdCurrentTicketAction,
  recallFromHoldAction,
  noShowAction,
  skipTicketAction
} from "@/server/actions/counterConsole.action"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Service {
  id: string
  name: string
  prefix: string
  avgDurationMinutes: number | null
}

interface Counter {
  id: string
  name: string
  queueId: string
  currentTicketId: string | null
  services: Service[]
}

interface Ticket {
  id: string
  code: string
  number: number
  status: string
  customer: string
  counterId: string | null
  createdAt: string
  calledAt: string | null
  startedAt: string | null
  completedAt: string | null
  service: Service
}

interface Props {
  counter: Counter
  initialTickets: Ticket[]
  orgSlug: string
  orgName: string
}

type TabType = "upcoming" | "hold" | "completed"

export default function CounterConsoleClient({
  counter,
  initialTickets,
  orgSlug,
  orgName,
}: Props) {
  const toasts = useToast()
  
  // State
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(counter.currentTicketId)
  const [actionLoading, setActionLoading] = useState(false)
  const [sseConnected, setSseConnected] = useState<"connected" | "reconnecting" | "error">("connected")
  const [activeTab, setActiveTab] = useState<TabType>("upcoming")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  // null = all services, string = specific service id
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // SSE Real-time syncing
  useEffect(() => {
    let active = true
    let eventSource: EventSource | null = null

    function connectSSE() {
      if (!active) return
      
      eventSource = new EventSource(`/api/queue/${counter.queueId}/stream`)

      eventSource.onopen = () => {
        if (active) setSseConnected("connected")
      }

      eventSource.onmessage = (event) => {
        if (!active) return
        try {
          const payload = JSON.parse(event.data)
          if (payload.tickets) {
            setTickets(payload.tickets)
          }
          if (payload.counters) {
            const thisCounter = payload.counters.find((c: any) => c.id === counter.id)
            if (thisCounter) {
              setCurrentTicketId(thisCounter.currentTicketId)
            }
          }
        } catch (err) {
          console.error("Failed to parse SSE payload:", err)
        }
      }

      eventSource.onerror = () => {
        if (active) {
          setSseConnected("reconnecting")
          eventSource?.close()
          // Retry connection in 3 seconds
          setTimeout(connectSSE, 3000)
        }
      }
    }

    connectSSE()

    return () => {
      active = false
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [counter.queueId, counter.id])

  // Active serving ticket timer
  const currentTicket = tickets.find((t) => t.id === currentTicketId) ||
    tickets.find((t) => t.status === "serving" && t.counterId === counter.id)

  useEffect(() => {
    if (!currentTicket || !currentTicket.calledAt) {
      setElapsedSeconds(0)
      return
    }

    const calledTime = new Date(currentTicket.calledAt).getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = Math.max(0, Math.floor((now - calledTime) / 1000))
      setElapsedSeconds(diff)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [currentTicket])

  // Helpers
  const getCustomerName = (ticket: Ticket) => {
    try {
      const customerObj = JSON.parse(ticket.customer || "{}")
      return customerObj.name || "Anonymous Customer"
    } catch {
      return "Anonymous Customer"
    }
  }

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  // Helpers — service-aware
  const hasMultipleServices = counter.services.length > 1
  const activeServiceIds = selectedServiceId
    ? [selectedServiceId]
    : counter.services.map((s) => s.id)

  // Handlers
  const autoCallNext = async () => {
    const nextRes = await callNextTicketAction(counter.id, selectedServiceId ?? undefined)
    if (nextRes.success) {
      toasts.success("Auto-called next ticket: " + nextRes.data.code)
    } else {
      console.log("No waiting tickets to auto-call next:", nextRes.error)
    }
  }

  const handleCallNext = async () => {
    setActionLoading(true)
    try {
      const res = await callNextTicketAction(counter.id, selectedServiceId ?? undefined)
      if (res.success) {
        toasts.success("Called ticket: " + res.data.code)
      } else {
        toasts.error(res.error || "No waiting tickets available")
      }
    } catch (err) {
      toasts.error("An unexpected error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCallSpecific = async (ticketId: string) => {
    setActionLoading(true)
    try {
      const res = await callSpecificTicketAction(ticketId, counter.id)
      if (res.success) {
        toasts.success("Called ticket: " + res.data.code)
        setActiveTab("upcoming")
      } else {
        toasts.error(res.error || "Failed to call ticket")
      }
    } catch (err) {
      toasts.error("An unexpected error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  const handleAnnounceCurrent = async () => {
    setActionLoading(true)
    try {
      const res = await announceCurrentTicketAction(counter.id)
      if (res.success) {
        toasts.success("Called ticket on live display: " + res.data.code)
      } else {
        toasts.error(res.error || "Failed to call ticket")
      }
    } catch (err) {
      toasts.error("An unexpected error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    setActionLoading(true)
    try {
      const res = await completeCurrentTicketAction(counter.id)
      if (res.success) {
        toasts.success("Ticket completed")
        await autoCallNext()
      } else {
        toasts.error(res.error || "Failed to complete ticket")
      }
    } catch (err) {
      toasts.error("An unexpected error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  const handleHold = async () => {
    setActionLoading(true)
    try {
      const res = await holdCurrentTicketAction(counter.id)
      if (res.success) {
        toasts.success("Ticket placed on hold")
      } else {
        toasts.error(res.error || "Failed to hold ticket")
      }
    } catch (err) {
      toasts.error("An unexpected error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  const handleResumeFromHold = async (ticketId: string) => {
    setActionLoading(true)
    try {
      const res = await recallFromHoldAction(ticketId, counter.id)
      if (res.success) {
        toasts.success("Resumed ticket: " + res.data.code)
      } else {
        toasts.error(res.error || "Failed to resume ticket")
      }
    } catch (err) {
      toasts.error("An unexpected error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  const handleNoShow = async () => {
    setActionLoading(true)
    try {
      const res = await noShowAction(counter.id)
      if (res.success) {
        toasts.success("Ticket marked as No-Show")
        await autoCallNext()
      } else {
        toasts.error(res.error || "Failed to mark as No-Show")
      }
    } catch (err) {
      toasts.error("An unexpected error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSkip = async () => {
    if (!currentTicket) return
    setActionLoading(true)
    try {
      const res = await skipTicketAction(currentTicket.id, counter.id)
      if (res.success) {
        toasts.success("Ticket skipped")
        await autoCallNext()
      } else {
        toasts.error(res.error || "Failed to skip ticket")
      }
    } catch (err) {
      toasts.error("An unexpected error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  // Search filter helper
  const matchesSearch = (ticket: Ticket) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const customerName = getCustomerName(ticket).toLowerCase()
    const code = ticket.code.toLowerCase()
    const serviceName = ticket.service.name.toLowerCase()
    return code.includes(query) || customerName.includes(query) || serviceName.includes(query)
  }

  // Lists (filtered by selected service and search)
  const upcomingTickets = tickets.filter(
    (t) => t.status === "waiting" && activeServiceIds.includes(t.service.id) && matchesSearch(t)
  )
  const holdTickets = tickets.filter(
    (t) => t.status === "hold" && activeServiceIds.includes(t.service.id) && matchesSearch(t)
  )
  const completedTickets = tickets.filter(
    (t) => (t.status === "done" || t.status === "no_show" || t.status === "skipped") && activeServiceIds.includes(t.service.id) && matchesSearch(t)
  )

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Console Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <Link href={`/org/${orgSlug}/counter`} className="hover:text-primary transition-colors">
              Counters
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>Console</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-on-surface flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary opacity-80" />
              {counter.name}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {counter.services.map((s) => s.name).join(", ")}
            </span>
          </div>
        </div>

        {/* SSE Status Banner */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="relative flex h-2 w-2">
            {sseConnected === "connected" ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </>
            )}
          </span>
          <span className="text-xs font-medium text-on-surface-variant/80">
            {sseConnected === "connected" ? "Live" : "Reconnecting"}
          </span>
        </div>
      </div>

      {/* Service Filter Bar — always shown when counter has services */}
      {counter.services.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-card/80 px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider shrink-0">
              {counter.services.length === 1 ? "Serving" : "Filter"}
            </span>
            {counter.services.length > 1 && (
              <button
                onClick={() => setSelectedServiceId(null)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  selectedServiceId === null
                    ? "bg-primary text-on-primary border-primary shadow-sm"
                    : "bg-transparent text-on-surface-variant border-border hover:border-primary/50 hover:text-primary"
                }`}
              >
                All Services
                <span className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  selectedServiceId === null ? "bg-on-primary/20" : "bg-surface-container"
                }`}>
                  {tickets.filter(t => t.status === "waiting").length}
                </span>
              </button>
            )}
            {counter.services.map((s) => {
              const count = tickets.filter(t => t.status === "waiting" && t.service.id === s.id).length
              const isOnlyService = counter.services.length === 1
              const isSelected = selectedServiceId === s.id || (isOnlyService && selectedServiceId === null)
              return (
                <button
                  key={s.id}
                  onClick={() => counter.services.length > 1 ? setSelectedServiceId(selectedServiceId === s.id ? null : s.id) : null}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                    isOnlyService
                      ? "bg-primary text-on-primary border-primary shadow-sm cursor-default"
                      : isSelected
                      ? "bg-primary text-on-primary border-primary shadow-sm cursor-pointer"
                      : "bg-transparent text-on-surface-variant border-border hover:border-primary/50 hover:text-primary cursor-pointer"
                  }`}
                >
                  {s.name}
                  <span className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isSelected || isOnlyService ? "bg-on-primary/20" : "bg-surface-container"
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Console Grid */}
      <div className="grid items-stretch gap-6 md:grid-cols-12">
        {/* Left Column: Active Call Card */}
        <div className="md:col-span-5 flex flex-col">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md flex-1 flex flex-col justify-between md:sticky md:top-6">
            {currentTicket ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-border/50 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {currentTicket.service.name}
                    </span>
                    <h2 className="text-sm font-bold text-on-surface mt-2 flex items-center gap-1.5">
                      <User className="h-4 w-4 opacity-75" />
                      {getCustomerName(currentTicket)}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-mono">{formatElapsed(elapsedSeconds)}</span>
                  </div>
                </div>

                {/* Ticket Code Display */}
                <div className="text-center py-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                    Now Serving Ticket
                  </p>
                  <h3 className="text-7xl font-black text-primary font-mono tracking-tight my-2">
                    {currentTicket.code}
                  </h3>
                  <p className="text-xs text-on-surface-variant/80">
                    Called at {new Date(currentTicket.calledAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Serving Controls */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <Button
                    onClick={handleAnnounceCurrent}
                    disabled={actionLoading}
                    className="col-span-2 h-11 rounded-full font-bold text-xs bg-tertiary text-on-tertiary hover:opacity-95 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                    Call Ticket
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={actionLoading}
                    className="h-11 rounded-full font-bold text-xs bg-primary text-on-primary hover:bg-primary/95 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Complete
                  </Button>
                  <Button
                    onClick={handleHold}
                    disabled={actionLoading}
                    className="h-11 rounded-full font-bold text-xs bg-secondary-container text-on-secondary-container hover:opacity-90 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Pause className="h-4 w-4" />
                    Put on Hold
                  </Button>
                  <Button
                    onClick={handleNoShow}
                    disabled={actionLoading}
                    variant="outline"
                    className="h-11 rounded-full font-bold text-xs border-error text-error hover:bg-error/5 flex items-center justify-center gap-1.5 cursor-pointer col-span-1"
                  >
                    <UserX className="h-4 w-4" />
                    No-Show
                  </Button>
                  <Button
                    onClick={handleSkip}
                    disabled={actionLoading}
                    variant="outline"
                    className="h-11 rounded-full font-bold text-xs border-border text-on-surface-variant hover:bg-surface-low flex items-center justify-center gap-1.5 cursor-pointer col-span-1"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip Ticket
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8">
                <div className="h-16 w-16 bg-surface-container rounded-3xl flex items-center justify-center text-on-surface-variant/40">
                  <Play className="h-8 w-8 ml-1" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="text-lg font-bold text-on-surface">No Active Ticket</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {upcomingTickets.length > 0
                      ? `${upcomingTickets.length} ticket${upcomingTickets.length > 1 ? 's' : ''} waiting${selectedServiceId ? ` for ${counter.services.find(s => s.id === selectedServiceId)?.name}` : ''}`
                      : "No tickets waiting in this queue."}
                  </p>
                </div>

                {/* Service quick-pick when multiple services */}
                {hasMultipleServices && (
                  <div className="flex flex-wrap gap-2 justify-center w-full">
                    {counter.services.map((s) => {
                      const cnt = tickets.filter(t => t.status === "waiting" && t.service.id === s.id).length
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedServiceId(selectedServiceId === s.id ? null : s.id)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                            selectedServiceId === s.id
                              ? "bg-primary text-on-primary border-primary"
                              : "bg-surface-low border-border text-on-surface-variant hover:border-primary/60"
                          }`}
                        >
                          {s.name} <span className="opacity-70">({cnt})</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <Button
                  onClick={handleCallNext}
                  disabled={actionLoading || upcomingTickets.length === 0}
                  className="w-full h-12 rounded-full font-black text-sm bg-primary text-on-primary hover:bg-primary/95 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-40"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {selectedServiceId
                    ? `Call Next — ${counter.services.find(s => s.id === selectedServiceId)?.name}`
                    : "Call Next Ticket"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tabbed Lists */}
        <div className="md:col-span-7 flex flex-col">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-md">
            {/* Search Bar */}
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50" />
                <input
                  type="text"
                  placeholder="Search by ticket code, customer name, or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 rounded-xl border border-border bg-surface-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-border/50 pb-2 mb-3 gap-1">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  activeTab === "upcoming"
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant/60 hover:text-on-surface"
                }`}
              >
                Upcoming ({upcomingTickets.length})
              </button>
              <button
                onClick={() => setActiveTab("hold")}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  activeTab === "hold"
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant/60 hover:text-on-surface"
                }`}
              >
                On Hold ({holdTickets.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  activeTab === "completed"
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant/60 hover:text-on-surface"
                }`}
              >
                Completed ({completedTickets.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="min-h-0 flex-1 overflow-hidden">
              {activeTab === "upcoming" && (
                <div className="flex h-full min-h-0 flex-col">
                  {upcomingTickets.length > 0 ? (
                    <div className="min-h-0 flex-1 overflow-auto pr-1">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 z-10 bg-card">
                          <tr className="border-b border-border/50 text-on-surface-variant/60 font-bold uppercase tracking-wider">
                            <th className="py-2 font-bold">Code</th>
                            <th className="py-2 font-bold">Customer</th>
                            <th className="py-2 font-bold">Service</th>
                            <th className="py-2 font-bold">Wait Time</th>
                            <th className="py-2 text-right font-bold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {upcomingTickets.map((t) => {
                            const waitMins = Math.max(
                              0,
                              Math.floor(
                                (new Date().getTime() - new Date(t.createdAt).getTime()) / 60000
                              )
                            )
                            return (
                              <tr key={t.id} className="hover:bg-surface-low/30 transition-colors">
                                <td className="py-2 font-mono font-extrabold text-primary text-sm">{t.code}</td>
                                <td className="py-2 font-semibold text-on-surface">{getCustomerName(t)}</td>
                                <td className="py-2 text-on-surface-variant">{t.service.name}</td>
                                <td className="py-2 text-on-surface-variant font-medium">
                                  {waitMins}m waiting
                                </td>
                                <td className="py-2 text-right">
                                  <Button
                                    onClick={() => handleCallSpecific(t.id)}
                                    disabled={actionLoading || !!currentTicketId}
                                    className="h-7 px-3 rounded-full font-bold text-[10px] bg-primary text-on-primary hover:opacity-90 cursor-pointer disabled:opacity-40"
                                  >
                                    Call
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-on-surface-variant/50 space-y-2">
                      <Clock className="h-8 w-8 opacity-45" />
                      <p className="text-sm font-semibold">No upcoming tickets</p>
                      <p className="text-xs">New tickets will show up here when customers issue them at the kiosk.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "hold" && (
                <div className="flex h-full min-h-0 flex-col">
                  {holdTickets.length > 0 ? (
                    <div className="min-h-0 flex-1 overflow-auto pr-1">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 z-10 bg-card">
                          <tr className="border-b border-border/50 text-on-surface-variant/60 font-bold uppercase tracking-wider">
                            <th className="py-2 font-bold">Code</th>
                            <th className="py-2 font-bold">Customer</th>
                            <th className="py-2 font-bold">Service</th>
                            <th className="py-2 text-right font-bold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {holdTickets.map((t) => (
                            <tr key={t.id} className="hover:bg-surface-low/30 transition-colors">
                              <td className="py-2 font-mono font-extrabold text-primary text-sm">{t.code}</td>
                              <td className="py-2 font-semibold text-on-surface">{getCustomerName(t)}</td>
                              <td className="py-2 text-on-surface-variant">{t.service.name}</td>
                              <td className="py-2 text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    onClick={() => handleCallSpecific(t.id)}
                                    disabled={actionLoading || !!currentTicketId}
                                    className="h-7 px-3 rounded-full font-bold text-[10px] bg-secondary-container text-on-secondary-container hover:opacity-90 cursor-pointer disabled:opacity-40"
                                  >
                                    Call
                                  </Button>
                                  <Button
                                    onClick={() => handleResumeFromHold(t.id)}
                                    disabled={actionLoading || !!currentTicketId}
                                    className="h-7 px-3 rounded-full font-bold text-[10px] bg-primary text-on-primary hover:opacity-90 cursor-pointer disabled:opacity-40"
                                  >
                                    Resume
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-on-surface-variant/50 space-y-2">
                      <Pause className="h-8 w-8 opacity-45" />
                      <p className="text-sm font-semibold">No tickets on hold</p>
                      <p className="text-xs">Place tickets on hold if the customer is not immediately present but might return.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "completed" && (
                <div className="flex h-full min-h-0 flex-col">
                  {completedTickets.length > 0 ? (
                    <div className="min-h-0 flex-1 overflow-auto pr-1">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 z-10 bg-card">
                          <tr className="border-b border-border/50 text-on-surface-variant/60 font-bold uppercase tracking-wider">
                            <th className="py-2 font-bold">Code</th>
                            <th className="py-2 font-bold">Customer</th>
                            <th className="py-2 font-bold">Service</th>
                            <th className="py-2 font-bold">Finished</th>
                            <th className="py-2 text-right font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {completedTickets.slice().reverse().map((t) => (
                            <tr key={t.id} className="hover:bg-surface-low/30 transition-colors">
                              <td className="py-2 font-mono font-extrabold text-on-surface-variant/65 text-sm">{t.code}</td>
                              <td className="py-2 font-semibold text-on-surface/85">{getCustomerName(t)}</td>
                              <td className="py-2 text-on-surface-variant/75">{t.service.name}</td>
                              <td className="py-2 text-on-surface-variant/70">
                                {t.completedAt
                                  ? new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : "-"}
                              </td>
                              <td className="py-2 text-right">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    t.status === "done"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                      : t.status === "no_show"
                                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                  }`}
                                >
                                  {t.status === "done"
                                    ? "Completed"
                                    : t.status === "no_show"
                                    ? "No-Show"
                                    : "Skipped"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-on-surface-variant/50 space-y-2">
                      <CheckCircle className="h-8 w-8 opacity-45" />
                      <p className="text-sm font-semibold">No completed tickets</p>
                      <p className="text-xs">Processed tickets for today's session will appear here.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
