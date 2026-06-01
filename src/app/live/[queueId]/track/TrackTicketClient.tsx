"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, Clock, Users, CheckCircle, XCircle, Ticket as TicketIcon, Pause, SkipForward, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseCustomerName } from "@/lib/customer-utils"

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
}

export function TrackTicketClient({ queueId, queueName, organizationName }: Props) {
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
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          title: "Waiting in Queue",
          description: "Please wait for your number to be called"
        }
      case "serving":
        const counter = counters.find((c) => c.id === foundTicket.counterId)
        return {
          icon: <CheckCircle className="h-8 w-8" />,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Now Being Served",
          description: counter ? `Please proceed to ${counter.name}` : "Please proceed to your counter"
        }
      case "hold":
        return {
          icon: <Pause className="h-8 w-8" />,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          title: "On Hold",
          description: "Your ticket is currently on hold. You may have already been called while you were away. Please wait to be called again, or proceed directly to the counter for assistance."
        }
      case "done":
        return {
          icon: <CheckCircle className="h-8 w-8" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          title: "Service Completed",
          description: "Thank you for your patience!"
        }
      case "skipped":
        return {
          icon: <SkipForward className="h-8 w-8" />,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Ticket Skipped",
          description: "Your ticket was skipped. Please speak to staff for assistance."
        }
      case "no_show":
        return {
          icon: <UserX className="h-8 w-8" />,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "No Show",
          description: "You missed your turn. Please get a new ticket or speak to staff."
        }
      case "cancelled":
        return {
          icon: <XCircle className="h-8 w-8" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          title: "Ticket Cancelled",
          description: "This ticket has been cancelled."
        }
      default:
        return {
          icon: <Clock className="h-8 w-8" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          title: "Unknown Status",
          description: "Please check with staff for assistance"
        }
    }
  }

  const statusInfo = getStatusInfo()
  const position = getPosition()
  const estimatedWait = getEstimatedWaitTime()

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#e3e2e0] px-6 py-6 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1c1a] leading-tight">{organizationName}</h1>
              <p className="text-[#424842] font-medium mt-1">{queueName}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
              <span className="font-semibold text-gray-600">
                Search to check status
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Search Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#e3e2e0]">
            <div className="text-center mb-6">
              <div className="h-16 w-16 mx-auto bg-[#cceace] rounded-2xl flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-[#4a654e]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1a1c1a] mb-2">Where's My Ticket?</h2>
              <p className="text-[#424842] text-sm">
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
                className="h-14 text-center text-2xl font-mono font-bold uppercase rounded-xl border-2 border-[#e3e2e0] focus-visible:ring-2 focus-visible:ring-[#4a654e]"
                disabled={isSearching}
                autoFocus
              />
              <Button
                onClick={handleSearch}
                disabled={!searchCode.trim() || isSearching}
                className="h-14 px-8 rounded-xl font-bold bg-[#4a654e] text-white hover:bg-[#334d38] disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>

            {notFound && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-900 font-bold mb-1">
                      Ticket Not Found
                    </p>
                    <p className="text-xs text-red-700">
                      We couldn't find a ticket with code <span className="font-mono font-bold">{searchCode}</span>. Please check your ticket code and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Status */}
          {foundTicket && statusInfo && (
            <div className={`bg-white rounded-2xl p-8 shadow-lg border-2 ${statusInfo.borderColor}`}>
              <div className="text-center mb-6">
                <div className={`h-16 w-16 mx-auto ${statusInfo.bgColor} rounded-2xl flex items-center justify-center mb-4 ${statusInfo.color}`}>
                  {statusInfo.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1a1c1a] mb-1">{statusInfo.title}</h3>
                <p className="text-[#424842] text-sm">{statusInfo.description}</p>
              </div>

              {/* Ticket Details */}
              <div className="bg-[#f4f3f1] rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <p className="text-xs font-bold text-[#737972] uppercase tracking-widest mb-2">
                    Your Ticket
                  </p>
                  <div className="text-6xl font-black font-mono text-[#4a654e] leading-none">
                    {foundTicket.code}
                  </div>
                </div>

                {foundTicket.customer && parseCustomerName(foundTicket.customer) && (
                  <div className="text-center mb-4">
                    <p className="text-sm font-semibold text-[#424842]">
                      {parseCustomerName(foundTicket.customer)}
                    </p>
                  </div>
                )}

                <div className="border-t border-[#e3e2e0] pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#737972]">Service:</span>
                    <span className="font-bold text-[#1a1c1a]">{foundTicket.service.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#737972]">Status:</span>
                    <span className={`font-bold capitalize ${statusInfo.color}`}>
                      {foundTicket.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Queue Position (only for waiting tickets) */}
              {foundTicket.status === "waiting" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#cceace] rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-[#4a654e]" />
                      <p className="text-xs font-bold text-[#07200f] uppercase tracking-wide">
                        Position
                      </p>
                    </div>
                    <p className="text-3xl font-black text-[#4a654e]">{position}</p>
                    <p className="text-xs text-[#424842] mt-1">in queue</p>
                  </div>

                  <div className="bg-[#dde7c7] rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-[#586249]" />
                      <p className="text-xs font-bold text-[#2a3122] uppercase tracking-wide">
                        Est. Wait
                      </p>
                    </div>
                    <p className="text-3xl font-black text-[#586249]">~{estimatedWait}</p>
                    <p className="text-xs text-[#424842] mt-1">minutes</p>
                  </div>
                </div>
              )}

              {/* Live Updates Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#737972]">
                <span className="font-semibold">Search again to refresh status</span>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#e3e2e0]">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-[#dde7c7] rounded-xl flex items-center justify-center flex-shrink-0">
                <TicketIcon className="h-5 w-5 text-[#586249]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1c1a] mb-2">Need Help?</h3>
                <ul className="text-sm text-[#424842] space-y-1">
                  <li>• Your ticket code is shown on your ticket receipt</li>
                  <li>• Position updates automatically as the queue moves</li>
                  <li>• Please stay nearby when your number is close</li>
                  <li>• Listen for your ticket number to be called</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e3e2e0] px-6 py-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-[#737972] font-semibold">
            Powered by Hi-Queue
          </p>
        </div>
      </footer>
    </div>
  )
}
