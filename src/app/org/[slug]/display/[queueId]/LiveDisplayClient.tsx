"use client"

import { useState, useEffect } from "react"
import { Monitor, Clock, Users, TrendingUp, Lock, Loader2 } from "lucide-react"
import { verifyKioskPasscodeAction } from "@/server/actions/ticket.action"

interface Service {
  id: string
  name: string
  prefix: string
  avgDurationMinutes: number | null
}

interface Queue {
  id: string
  name: string
  description: string | null
  organization: {
    name: string
    portalBranding?: string
  }
}

interface Counter {
  id: string
  name: string
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
  service: Service
}

interface Props {
  queue: Queue
  initialTickets: Ticket[]
  initialCounters: Counter[]
  orgSlug: string
  hasPasscode: boolean
}

export function LiveDisplayClient({ queue, initialTickets, initialCounters, orgSlug, hasPasscode }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [counters, setCounters] = useState<Counter[]>(initialCounters)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isAuthenticated, setIsAuthenticated] = useState(!hasPasscode)
  const [isHydrated, setIsHydrated] = useState(false)
  const [enteredPasscode, setEnteredPasscode] = useState("")
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Check persisted auth on mount
  useEffect(() => {
    setIsHydrated(true)
    if (hasPasscode) {
      const persisted = localStorage.getItem(`display_unlocked_${queue.id}`)
      if (persisted === "true") {
        setIsAuthenticated(true)
      }
    }
  }, [hasPasscode, queue.id])

  // SSE Real-time syncing
  useEffect(() => {
    if (!isAuthenticated) return

    let active = true
    let eventSource: EventSource | null = null

    function connectSSE() {
      if (!active) return
      
      eventSource = new EventSource(`/api/queue/${queue.id}/stream`)

      eventSource.onmessage = (event) => {
        if (!active) return
        try {
          const payload = JSON.parse(event.data)
          if (payload.tickets) {
            setTickets(payload.tickets)
          }
          if (payload.counters) {
            setCounters(payload.counters)
          }
        } catch (err) {
          console.error("Failed to parse SSE payload:", err)
        }
      }

      eventSource.onerror = () => {
        if (active) {
          eventSource?.close()
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
  }, [queue.id, isAuthenticated])

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Handle authentication
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enteredPasscode.trim()) {
      setAuthError("Please enter a passcode.")
      return
    }

    setIsAuthLoading(true)
    setAuthError(null)

    try {
      const res = await verifyKioskPasscodeAction(queue.id, enteredPasscode)
      if (res.success) {
        setIsAuthenticated(true)
        localStorage.setItem(`display_unlocked_${queue.id}`, "true")
      } else {
        setAuthError(res.error || "Invalid passcode. Please try again.")
        setEnteredPasscode("")
      }
    } catch (err) {
      setAuthError("An error occurred. Please try again.")
    } finally {
      setIsAuthLoading(false)
    }
  }

  const getCustomerName = (ticket: Ticket) => {
    try {
      const customerObj = JSON.parse(ticket.customer || "{}")
      return customerObj.name || "Customer"
    } catch {
      return "Customer"
    }
  }

  // Get serving tickets with their counter info
  const servingTickets = tickets
    .filter((t) => t.status === "serving")
    .map((ticket) => {
      const counter = counters.find((c) => c.id === ticket.counterId)
      return { ticket, counter }
    })
    .filter((item) => item.counter)

  // Get waiting tickets
  const waitingTickets = tickets
    .filter((t) => t.status === "waiting")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 10) // Show next 10 waiting

  // Parse portal branding
  let branding: { primaryColor?: string; logoUrl?: string; welcomeMessage?: string } = {}
  try {
    if (queue.organization?.portalBranding) {
      branding = JSON.parse(queue.organization.portalBranding)
    }
  } catch (err) {
    console.error("Failed to parse portal branding:", err)
  }

  const primaryColor = branding.primaryColor || "#4a654e"
  const logoUrl = branding.logoUrl
  const welcomeMessage = branding.welcomeMessage || `Welcome to ${queue.organization?.name || "our facility"}`

  // Show auth screen if not authenticated
  if (!isHydrated || (hasPasscode && !isAuthenticated)) {
    return (
      <div className="fixed inset-0 bg-[#faf9f6] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-[1.5rem] p-8 shadow-[0_10px_40px_rgba(44,74,62,0.08)]">
            <div className="text-center mb-8">
              <div className="h-16 w-16 mx-auto bg-[#cceace] rounded-[1rem] flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-[#4a654e]" />
              </div>
              <h1 className="text-[28px] font-bold text-[#1a1c1a] mb-2 leading-tight">Display Access</h1>
              <p className="text-[#424842] text-sm leading-relaxed">
                Enter the passcode to view the live display
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={enteredPasscode}
                  onChange={(e) => {
                    setEnteredPasscode(e.target.value)
                    setAuthError(null)
                  }}
                  placeholder="Enter passcode"
                  className="w-full h-12 px-4 rounded-[0.75rem] bg-[#f4f3f1] border-0 text-[#1a1c1a] placeholder:text-[#737972] focus:outline-none focus:ring-2 focus:ring-[#4a654e] focus:bg-white transition-all"
                  disabled={isAuthLoading}
                  autoFocus
                />
                {authError && (
                  <p className="text-[#ba1a1a] text-xs mt-2 font-semibold">{authError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isAuthLoading || !enteredPasscode.trim()}
                className="w-full h-12 rounded-full font-bold bg-[#4a654e] text-white hover:bg-[#334d38] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(44,74,62,0.15)]"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Unlock Display"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#faf9f6] overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#e3e2e0] px-8 py-6 flex-shrink-0 shadow-[0_2px_8px_rgba(44,74,62,0.04)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-14 w-auto object-contain" />
            )}
            <div>
              <h1 className="text-[28px] font-bold text-[#1a1c1a] leading-tight tracking-tight">{queue.organization.name}</h1>
              <p className="text-[#424842] font-medium mt-1">{queue.name}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[40px] font-bold font-mono text-[#1a1c1a] leading-none tracking-tight">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-[#424842] font-medium mt-1">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8 text-center flex-shrink-0">
          <h2 className="text-[20px] font-semibold text-[#1a1c1a]">{welcomeMessage}</h2>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
          {/* Left Column: Now Serving */}
          <div className="col-span-8 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-6 flex-shrink-0">
              <div className="h-12 w-12 rounded-[1rem] bg-[#cceace] flex items-center justify-center">
                <Monitor className="h-6 w-6 text-[#4a654e]" />
              </div>
              <h2 className="text-[28px] font-bold text-[#1a1c1a] leading-tight">Now Serving</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 min-h-0">
              {servingTickets.length > 0 ? (
                servingTickets.map(({ ticket, counter }) => (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-[1.5rem] p-8 shadow-[0_10px_40px_rgba(44,74,62,0.08)] border border-[#e3e2e0]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-xs font-bold text-[#737972] uppercase tracking-widest mb-2">
                            Ticket
                          </div>
                          <div 
                            className="text-[64px] font-black font-mono leading-none tracking-tight"
                            style={{ color: primaryColor }}
                          >
                            {ticket.code}
                          </div>
                        </div>
                        
                        <div className="h-20 w-px bg-[#e3e2e0]"></div>
                        
                        <div>
                          <div className="text-xs font-bold text-[#737972] uppercase tracking-widest mb-2">
                            Counter
                          </div>
                          <div className="text-[40px] font-black text-[#1a1c1a] leading-none tracking-tight">
                            {counter?.name}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#cceace] border border-[#b0ceb2] mb-3">
                          <div className="h-2 w-2 rounded-full bg-[#4a654e] animate-pulse"></div>
                          <span className="text-xs font-bold text-[#07200f]">Serving Now</span>
                        </div>
                        <div className="text-base font-semibold text-[#424842]">
                          {ticket.service.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-[1.5rem] p-16 text-center h-full flex flex-col items-center justify-center shadow-[0_10px_40px_rgba(44,74,62,0.08)] border border-[#e3e2e0]">
                  <div className="h-20 w-20 rounded-full bg-[#f4f3f1] flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-10 w-10 text-[#737972]" />
                  </div>
                  <h3 className="text-[20px] font-bold text-[#424842] mb-2">No Active Service</h3>
                  <p className="text-[#737972]">Waiting for next customer...</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Waiting Queue */}
          <div className="col-span-4 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-6 flex-shrink-0">
              <div className="h-12 w-12 rounded-[1rem] bg-[#dde7c7] flex items-center justify-center">
                <Users className="h-6 w-6 text-[#586249]" />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-[#1a1c1a] leading-tight">Waiting Queue</h2>
                <p className="text-xs text-[#737972] font-semibold">{waitingTickets.length} in line</p>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-[1.5rem] p-6 overflow-y-auto min-h-0 shadow-[0_10px_40px_rgba(44,74,62,0.08)] border border-[#e3e2e0]">
              {waitingTickets.length > 0 ? (
                <div className="space-y-3">
                  {waitingTickets.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className="bg-[#f4f3f1] rounded-[1rem] p-4 hover:bg-[#efeeeb] transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-[0.5rem] bg-[#cceace] flex items-center justify-center text-xs font-black text-[#4a654e]">
                            {index + 1}
                          </div>
                          <div className="text-[24px] font-black font-mono leading-none" style={{ color: primaryColor }}>
                            {ticket.code}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-[#737972] font-semibold ml-10">
                        {ticket.service.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 h-full flex flex-col items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-[#f4f3f1] flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-[#737972]" />
                  </div>
                  <p className="text-[#737972] font-semibold text-sm">No tickets waiting</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 flex-shrink-0">
              <div className="bg-white rounded-[1rem] p-4 shadow-[0_4px_12px_rgba(44,74,62,0.06)] border border-[#e3e2e0]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-[#4a654e]" />
                  <span className="text-xs font-bold text-[#737972] uppercase tracking-wider">Serving</span>
                </div>
                <div className="text-[28px] font-black text-[#1a1c1a] leading-none">{servingTickets.length}</div>
              </div>
              
              <div className="bg-white rounded-[1rem] p-4 shadow-[0_4px_12px_rgba(44,74,62,0.06)] border border-[#e3e2e0]">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-[#586249]" />
                  <span className="text-xs font-bold text-[#737972] uppercase tracking-wider">Waiting</span>
                </div>
                <div className="text-[28px] font-black text-[#1a1c1a] leading-none">{waitingTickets.length}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e3e2e0] px-8 py-4 flex-shrink-0 shadow-[0_-2px_8px_rgba(44,74,62,0.04)]">
        <div className="flex items-center justify-between text-xs text-[#737972]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#4a654e] animate-pulse"></div>
            <span className="font-semibold">Live Updates Active</span>
          </div>
          <div className="font-semibold">
            Powered by Hi-Queue
          </div>
        </div>
      </footer>
    </div>
  )
}
