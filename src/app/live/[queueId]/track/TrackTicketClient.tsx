"use client"

import { useState } from "react"
import { Search, Loader2, Clock, Users, CheckCircle, XCircle, Ticket as TicketIcon, Pause, SkipForward, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseCustomerName } from "@/lib/customer-utils"
import type { PortalTheme } from "@/lib/portal-theme"
import { TrackLayoutShell } from "@/components/portal/layouts/TrackLayouts"

interface Service {
  id: string
  name: string
  prefix: string
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

interface Counter {
  id: string
  name: string
}

interface Props {
  queueId: string
  queueName: string
  organizationName: string
  portalTheme?: PortalTheme
  logoUrl?: string | null
}

export function TrackTicketClient({ queueId, queueName, organizationName, portalTheme, logoUrl }: Props) {
  const [searchCode, setSearchCode] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([])
  const [counters, setCounters] = useState<Counter[]>([])

  const handleSearch = async () => {
    if (!searchCode.trim()) return
    
    setIsSearching(true)
    setNotFound(false)
    setFoundTicket(null) // Clear previous result
    
    try {
      // Fetch current queue data
      const response = await fetch(`/api/queue/${queueId}/stream`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch queue data')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        setNotFound(true)
        setIsSearching(false)
        return
      }

      // Read the first SSE message
      const { value, done } = await reader.read()
      
      // Close connection immediately after first read
      try {
        await reader.cancel()
      } catch {
        // Ignore cancel errors
      }

      if (done || !value) {
        setNotFound(true)
        setIsSearching(false)
        return
      }

      const text = decoder.decode(value)
      const lines = text.split('\n')
      
      let ticketFound = false
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          try {
            const payload = JSON.parse(data)
            
            if (payload.tickets && payload.counters) {
              const normalizedSearch = searchCode.trim().toUpperCase()
              
              const ticket = payload.tickets.find(
                (t: Ticket) => t.code.toUpperCase() === normalizedSearch
              )
              
              if (ticket) {
                setFoundTicket(ticket)
                setWaitingTickets(payload.tickets.filter((t: Ticket) => t.status === 'waiting'))
                setCounters(payload.counters)
                setNotFound(false)
                ticketFound = true
              }
            }
            break
          } catch (err) {
            console.error("Failed to parse data:", err)
          }
        }
      }
      
      // If we processed the data but didn't find the ticket
      if (!ticketFound) {
        setNotFound(true)
      }
    } catch (err) {
      console.error("Search failed:", err)
      setNotFound(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const getPosition = () => {
    if (!foundTicket || foundTicket.status !== 'waiting') return 0
    
    const position = waitingTickets
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .findIndex((t) => t.id === foundTicket.id)
    
    return position === -1 ? 0 : position + 1
  }

  const getEstimatedWaitTime = () => {
    const position = getPosition()
    const avgTime = foundTicket?.service ? 10 : 10 // Default 10 minutes
    return position * avgTime
  }

  const getStatusInfo = () => {
    if (!foundTicket) return null

    switch (foundTicket.status) {
      case "waiting":
        return {
          icon: <Clock className="h-8 w-8" />,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          title: "Waiting in Queue",
          description: "Please wait for your number to be called"
        }
      case "serving":
        const counter = counters.find((c) => c.id === foundTicket.counterId)
        return {
          icon: <CheckCircle className="h-8 w-8" />,
          color: "text-primary",
          bgColor: "bg-primary/10",
          borderColor: "border-primary/20",
          title: "Now Being Served",
          description: counter ? `Please proceed to ${counter.name}` : "Please proceed to your counter"
        }
      case "hold":
        return {
          icon: <Pause className="h-8 w-8" />,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
          borderColor: "border-purple-500/20",
          title: "On Hold",
          description: "Your ticket is currently on hold. You may have already been called while you were away. Please wait to be called again, or proceed directly to the counter for assistance."
        }
      case "done":
        return {
          icon: <CheckCircle className="h-8 w-8" />,
          color: "text-blue-500",
          bgColor: "bg-blue-50/10",
          borderColor: "border-blue-500/20",
          title: "Service Completed",
          description: "Thank you for your patience!"
        }
      case "skipped":
        return {
          icon: <SkipForward className="h-8 w-8" />,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          borderColor: "border-orange-500/20",
          title: "Ticket Skipped",
          description: "Your ticket was skipped. Please speak to staff for assistance."
        }
      case "no_show":
        return {
          icon: <UserX className="h-8 w-8" />,
          color: "text-error",
          bgColor: "bg-error/10",
          borderColor: "border-error/20",
          title: "No Show",
          description: "You missed your turn. Please get a new ticket or speak to staff."
        }
      case "cancelled":
        return {
          icon: <XCircle className="h-8 w-8" />,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          borderColor: "border-border",
          title: "Ticket Cancelled",
          description: "This ticket has been cancelled."
        }
      default:
        return {
          icon: <Clock className="h-8 w-8" />,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          borderColor: "border-border",
          title: "Unknown Status",
          description: "Please check with staff for assistance"
        }
    }
  }

  const statusInfo = getStatusInfo()
  const position = getPosition()
  const estimatedWait = getEstimatedWaitTime()
  const layoutPreset = portalTheme?.layout?.track ?? "centered"
  const trackControls = portalTheme?.layoutControls?.track

  const themeClass = portalTheme?.themeClass ?? ""
  const modeClass = themeClass !== "theme-custom" && portalTheme?.mode === "dark" ? "dark" : ""
  const shouldApplyCustomVars = themeClass === "theme-custom" && portalTheme?.cssVars
  const themeStyle = shouldApplyCustomVars ? portalTheme?.cssVars : {}
  const radius = trackControls?.sharpness ?? 16

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 bg-background text-foreground ${themeClass} ${modeClass}`}
      style={{
        ...themeStyle,
        backgroundColor: trackControls?.pageBg,
        backgroundImage: trackControls?.pageBgImage ? `url(${trackControls.pageBgImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        color: trackControls?.fontColor,
      }}
    >
      <div
        className="flex-grow flex flex-col min-h-0"
        style={{
          transform: trackControls?.typographyScale && trackControls.typographyScale !== 1 ? `scale(${trackControls.typographyScale})` : undefined,
          transformOrigin: "top center",
          ...({
            "--login-radius": trackControls?.sharpness !== undefined ? `${trackControls.sharpness}px` : undefined,
          } as React.CSSProperties),
        }}
      >
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-6 shadow-sm z-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={`${organizationName} logo`} className="h-10 w-10 object-contain bg-white rounded-lg border border-border" />
                ) : null}
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-on-surface leading-tight">{organizationName}</h1>
                  <p className="text-on-surface-variant font-medium mt-1">{queueName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                <span className="font-semibold text-on-surface-variant">
                  Search to check status
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-grow px-6 py-12`}>
          <TrackLayoutShell
            layout={layoutPreset}
            search={
              <div 
                className="bg-card p-8 shadow-lg border border-border"
                style={{ borderRadius: `${radius}px` }}
              >
                <div className="text-center mb-6">
                  <div 
                    className="h-16 w-16 mx-auto bg-primary/10 text-primary flex items-center justify-center mb-4"
                    style={{ borderRadius: `${radius * 0.75}px` }}
                  >
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface mb-2">Where's My Ticket?</h2>
                  <p className="text-on-surface-variant text-sm">
                    Enter your ticket code to check your position in the queue
                  </p>
                </div>

                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="e.g. A001"
                    value={searchCode}
                    onChange={(e) => {
                      setSearchCode(e.target.value.toUpperCase())
                      setNotFound(false)
                    }}
                    onKeyDown={handleKeyPress}
                    className="h-14 text-center text-2xl font-mono font-bold uppercase border-2 border-border bg-surface-container text-on-surface focus-visible:ring-2 focus-visible:ring-primary"
                    style={{ borderRadius: `${radius * 0.75}px` }}
                    disabled={isSearching}
                    autoFocus
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={!searchCode.trim() || isSearching}
                    className="h-14 px-8 font-bold bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
                    style={{ borderRadius: `${radius * 0.75}px` }}
                  >
                    {isSearching ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {notFound && (
                  <div 
                    className="mt-4 p-4 bg-error-container text-on-error-container border-2 border-error"
                    style={{ borderRadius: `${radius * 0.75}px` }}
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1">
                          Ticket Not Found
                        </p>
                        <p className="text-xs opacity-90">
                          We couldn't find a ticket with code <span className="font-mono font-bold">{searchCode}</span>. Please check your ticket code and try again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            }

            status={foundTicket && statusInfo ? (
              <div 
                className={`bg-card p-8 shadow-lg border-2 ${statusInfo.borderColor}`}
                style={{ borderRadius: `${radius}px` }}
              >
                <div className="text-center mb-6">
                  <div 
                    className={`h-16 w-16 mx-auto ${statusInfo.bgColor} flex items-center justify-center mb-4 ${statusInfo.color}`}
                    style={{ borderRadius: `${radius * 0.75}px` }}
                  >
                    {statusInfo.icon}
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-1">{statusInfo.title}</h3>
                  <p className="text-on-surface-variant text-sm">{statusInfo.description}</p>
                </div>

                {/* Ticket Details */}
                <div 
                  className="bg-surface-container p-6 mb-6"
                  style={{ borderRadius: `${radius * 0.75}px` }}
                >
                  <div className="text-center mb-4">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                      Your Ticket
                    </p>
                    <div className="text-6xl font-black font-mono text-primary leading-none">
                      {foundTicket.code}
                    </div>
                  </div>

                  {foundTicket.customer && parseCustomerName(foundTicket.customer) && (
                    <div className="text-center mb-4">
                      <p className="text-sm font-semibold text-on-surface-variant">
                        {parseCustomerName(foundTicket.customer)}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-on-surface-variant">Service:</span>
                      <span className="font-bold text-on-surface">{foundTicket.service.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-on-surface-variant">Status:</span>
                      <span className={`font-bold capitalize ${statusInfo.color}`}>
                        {foundTicket.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Queue Position (only for waiting tickets) */}
                {foundTicket.status === "waiting" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className="bg-primary/10 text-primary p-4 text-center"
                      style={{ borderRadius: `${radius * 0.75}px` }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-primary" />
                        <p className="text-xs font-bold text-primary uppercase tracking-wide">
                          Position
                        </p>
                      </div>
                      <p className="text-3xl font-black text-primary">{position}</p>
                      <p className="text-xs text-on-surface-variant mt-1">in queue</p>
                    </div>

                    <div 
                      className="bg-secondary/15 p-4 text-center"
                      style={{ borderRadius: `${radius * 0.75}px` }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-secondary" />
                        <p className="text-xs font-bold text-secondary uppercase tracking-wide">
                          Est. Wait
                        </p>
                      </div>
                      <p className="text-3xl font-black text-secondary">~{estimatedWait}</p>
                      <p className="text-xs text-on-surface-variant mt-1">minutes</p>
                    </div>
                  </div>
                )}

                {/* Live Updates Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-on-surface-variant">
                  <span className="font-semibold">Search again to refresh status</span>
                </div>
              </div>
            ) : null}

            help={
              <div 
                className="bg-card p-6 shadow-lg border border-border"
                style={{ borderRadius: `${radius}px` }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="h-10 w-10 bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0"
                    style={{ borderRadius: `${radius * 0.6}px` }}
                  >
                    <TicketIcon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface mb-2">Need Help?</h3>
                    <ul className="text-sm text-on-surface-variant space-y-1">
                      <li>• Your ticket code is shown on your ticket receipt</li>
                      <li>• Position updates automatically as the queue moves</li>
                      <li>• Please stay nearby when your number is close</li>
                      <li>• Listen for your ticket number to be called</li>
                    </ul>
                  </div>
                </div>
              </div>
            }
          />
        </main>

        {/* Footer */}
        <footer className="bg-card border-t border-border px-6 py-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs text-on-surface-variant font-semibold">
              Powered by Hi-Queue
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
