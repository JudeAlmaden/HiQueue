"use client"

import { useState, useEffect, useRef } from "react"
import { createTicketAction, verifyKioskPasscodeAction } from "@/server/actions/ticket.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import {
  CheckCircle,
  Clock,
  Users,
  Lock,
  Loader2,
  ArrowRight,
  LogOut,
  Ticket,
} from "lucide-react"

interface Service {
  id: string
  name: string
  prefix: string
  avgDurationMinutes: number | null
  isActive: boolean
}

interface Props {
  queueId: string
  queueName: string
  queueDescription: string | null
  hasPasscode: boolean
  services: Service[]
  initialQueueOpen: boolean
}

interface LatestCallEvent {
  id: string
  ticketId: string
  ticketCode: string
  counterId: string | null
  createdAt: string
}

type Screen = "AUTH" | "TICKET" | "SUCCESS"

export function LiveKioskClient({
  queueId,
  queueName,
  queueDescription,
  hasPasscode,
  services,
}: Props) {
  const toasts = useToast()
  const [screen, setScreen] = useState<Screen>(hasPasscode ? "AUTH" : "TICKET")
  const [isHydrated, setIsHydrated] = useState(false)

  // Auth state
  const [enteredPasscode, setEnteredPasscode] = useState("")
  const [keepAuthenticated, setKeepAuthenticated] = useState(true)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Ticketing state
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Success state
  const [createdTicket, setCreatedTicket] = useState<{
    code: string
    number: number
    waitCount: number
    estimatedWaitTime: number
    serviceName: string
    customerName?: string
  } | null>(null)
  const [countdown, setCountdown] = useState(12)
  const [servingTickets, setServingTickets] = useState<any[]>([])
  const lastCallEventId = useRef<string | null | undefined>(undefined)

  const playCallSound = () => {
    type AudioWindow = Window & {
      webkitAudioContext?: typeof AudioContext
    }

    try {
      const AudioContextConstructor = window.AudioContext || (window as AudioWindow).webkitAudioContext
      if (!AudioContextConstructor) return

      const audioContext = new AudioContextConstructor()
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator()
        const gain = audioContext.createGain()

        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(frequency, startTime)
        gain.gain.setValueAtTime(0.001, startTime)
        gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        oscillator.connect(gain)
        gain.connect(audioContext.destination)
        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }

      const now = audioContext.currentTime
      playTone(660, now, 0.22)
      playTone(880, now + 0.25, 0.28)
    } catch (error) {
      console.error("Kiosk failed to play call sound:", error)
    }
  }

  // SSE connection for Now Serving updates
  useEffect(() => {
    let active = true
    let eventSource: EventSource | null = null

    function connectSSE() {
      if (!active) return
      
      eventSource = new EventSource(`/api/queue/${queueId}/stream`)

      eventSource.onmessage = (event) => {
        if (!active) return
        try {
          const payload = JSON.parse(event.data)
          if (payload.tickets) {
            const serving = payload.tickets.filter((t: any) => t.status === "serving")
            setServingTickets(serving)
          }
          const latestCallEvent = payload.latestCallEvent as LatestCallEvent | null | undefined
          if (latestCallEvent !== undefined) {
            if (lastCallEventId.current === undefined) {
              lastCallEventId.current = latestCallEvent?.id ?? null
            } else if (latestCallEvent?.id && latestCallEvent.id !== lastCallEventId.current) {
              lastCallEventId.current = latestCallEvent.id
              playCallSound()
            }
          }
        } catch (err) {
          console.error("Kiosk failed to parse SSE payload:", err)
        }
      }

      eventSource.onerror = () => {
        if (active) {
          eventSource?.close()
          setTimeout(connectSSE, 5000)
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
  }, [queueId])

  // Check persisted auth token on mount
  useEffect(() => {
    setIsHydrated(true)
    if (hasPasscode) {
      const persisted = localStorage.getItem(`kiosk_unlocked_${queueId}`)
      if (persisted === "true") {
        setScreen("TICKET")
      } else {
        setScreen("AUTH")
      }
    } else {
      setScreen("TICKET")
    }
  }, [hasPasscode, queueId])

  // Auto-reset countdown on SUCCESS
  useEffect(() => {
    if (screen !== "SUCCESS") return
    setCountdown(12)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleReset()
          return 12
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [screen])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enteredPasscode.trim()) {
      setAuthError("Please enter a passcode.")
      return
    }
    setIsAuthLoading(true)
    setAuthError(null)

    const res = await verifyKioskPasscodeAction(queueId, enteredPasscode)
    if (res.success) {
      if (keepAuthenticated) {
        localStorage.setItem(`kiosk_unlocked_${queueId}`, "true")
      }
      setScreen("TICKET")
      toasts.success("Kiosk unlocked!")
    } else {
      setAuthError(res.error || "Incorrect passcode.")
    }
    setIsAuthLoading(false)
  }

  const handleGetTicket = async () => {
    if (!selectedServiceId) return
    setIsSubmitting(true)
    try {
      const res = await createTicketAction({
        queueId,
        serviceId: selectedServiceId,
        customerName: customerName.trim() || null,
      })

      if (res.success) {
        setCreatedTicket({
          code: res.data.ticket.code,
          number: res.data.ticket.number,
          waitCount: res.data.waitCount,
          estimatedWaitTime: res.data.estimatedWaitTime,
          serviceName: res.data.serviceName,
          customerName: customerName.trim() || undefined,
        })
        setScreen("SUCCESS")
      } else {
        toasts.error(res.error || "Failed to generate ticket")
      }
    } catch {
      toasts.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setCustomerName("")
    setSelectedServiceId(null)
    setCreatedTicket(null)
    setScreen("TICKET")
  }

  const handleLockKiosk = () => {
    localStorage.removeItem(`kiosk_unlocked_${queueId}`)
    setEnteredPasscode("")
    setScreen("AUTH")
  }

  const selectedService = services.find((s) => s.id === selectedServiceId)

  // ── Render: Loading / hydrating ──────────────────────────────────────────
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  // ── Render: AUTH ─────────────────────────────────────────────────────────
  if (screen === "AUTH") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0] px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />

          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-11 w-11 mx-auto bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                <Lock className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold text-on-surface">Kiosk Locked</h1>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                Enter the access passcode to setup{" "}
                <span className="font-semibold text-on-surface">{queueName}</span> live ticketing.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  type="password"
                  placeholder="Passcode"
                  value={enteredPasscode}
                  onChange={(e) => {
                    setEnteredPasscode(e.target.value)
                    setAuthError(null)
                  }}
                  className="h-11 rounded-xl border border-outline-variant bg-surface-container text-center tracking-[0.3em] text-base font-mono focus-visible:ring-2 focus-visible:ring-primary"
                  disabled={isAuthLoading}
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-error text-center font-medium">{authError}</p>
                )}
              </div>

              <label className="flex items-center justify-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepAuthenticated}
                  onChange={(e) => setKeepAuthenticated(e.target.checked)}
                  className="h-4 w-4 accent-primary rounded"
                />
                <span className="text-xs text-on-surface-variant select-none">
                  Keep me logged in on this device
                </span>
              </label>

              <Button
                type="submit"
                disabled={isAuthLoading}
                className="w-full h-11 rounded-full text-sm font-bold bg-primary text-on-primary hover:opacity-90 shadow-sm"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  "Unlock Kiosk"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: SUCCESS ──────────────────────────────────────────────────────
  if (screen === "SUCCESS" && createdTicket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0] px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden text-center">
          <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />

          <div className="p-8 space-y-6">
            {/* Icon */}
            <div className="h-14 w-14 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8" />
            </div>

            {/* Heading */}
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-on-surface">Your Ticket is Ready!</h1>
              <p className="text-xs text-on-surface-variant">
                Please wait. We'll call your number shortly.
              </p>
            </div>

            {/* Ticket stub */}
            <div className="bg-surface-container rounded-2xl border border-outline-variant/30 px-6 py-5 space-y-1 max-w-[200px] mx-auto">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                {createdTicket.serviceName}
              </p>
              <div className="text-6xl font-black text-primary font-mono tracking-tight leading-none py-2">
                {createdTicket.code}
              </div>
              {createdTicket.customerName && (
                <p className="text-xs font-semibold text-on-surface truncate">
                  {createdTicket.customerName}
                </p>
              )}
              <div className="border-t border-dashed border-outline-variant/50 pt-3 mt-2 flex items-center justify-between text-[10px] text-on-surface-variant/70">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {createdTicket.waitCount} ahead
                </span>
                <span className="flex items-center gap-1 font-bold text-primary">
                  <Clock className="h-3 w-3" />
                  ~{createdTicket.estimatedWaitTime}m
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-2.5">
              <Button
                onClick={handleReset}
                className="w-full h-11 rounded-full text-sm font-bold bg-primary text-on-primary hover:opacity-90 flex items-center justify-center gap-2 shadow-sm"
              >
                Next Ticket
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-[11px] text-on-surface-variant/50">
                Auto-returning in <span className="font-bold text-primary">{countdown}s</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: TICKETING ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2 opacity-60">
          <div className="h-6 w-6 bg-primary rounded-lg flex items-center justify-center text-on-primary text-[10px] font-bold">
            HQ
          </div>
          <span className="text-xs font-bold text-on-surface tracking-tight">HiQueue</span>
        </div>
        {hasPasscode && (
          <button
            onClick={handleLockKiosk}
            className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/60 hover:text-error transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Lock Kiosk
          </button>
        )}
      </div>

      {/* Main card */}
      <div className="flex-grow flex items-center justify-center px-4 pb-8 w-full max-w-lg mx-auto">
        {/* Ticketing Form Card */}
        <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between">
          <div>
            <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />

            <div className="p-8 space-y-6">
              {/* Title */}
              <div className="text-center space-y-1.5">
                <h1 className="text-3xl font-extrabold text-primary tracking-tight">
                  Get Your Ticket
                </h1>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
                  {queueDescription || `Welcome to ${queueName}. Let's make your experience hassle-free.`}
                </p>
              </div>

              {/* Service Selector */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-on-surface-variant text-center tracking-wide">
                  Choose where to queue:
                </p>

                {services.length > 0 ? (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {services.map((service) => {
                      const isClosed = !service.isActive
                      return (
                        <button
                          key={service.id}
                          disabled={isClosed}
                          onClick={() =>
                            setSelectedServiceId(
                              selectedServiceId === service.id ? null : service.id
                            )
                          }
                          className={`
                            px-5 py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200 min-w-[100px] flex items-center justify-center gap-1.5
                            ${
                              isClosed
                                ? "border-dashed border-red-200/50 bg-red-50/20 text-on-surface-variant/40 cursor-not-allowed opacity-60"
                                : selectedServiceId === service.id
                                  ? "border-primary bg-primary text-on-primary shadow-md scale-105 cursor-pointer"
                                  : "border-outline-variant bg-surface-container text-on-surface hover:border-primary/50 hover:bg-surface-low cursor-pointer"
                            }
                          `}
                        >
                          {isClosed && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
                          <span>{service.name}</span>
                          {isClosed && <span className="text-[10px] font-semibold text-red-500/80 ml-0.5">(Closed)</span>}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center border border-dashed border-outline-variant rounded-xl py-8">
                    <Ticket className="h-8 w-8 mx-auto text-on-surface-variant/40 mb-2" />
                    <p className="text-sm font-semibold text-on-surface/60">No services configured</p>
                    <p className="text-xs text-on-surface-variant/50 mt-0.5">
                      An admin needs to add services to this queue.
                    </p>
                  </div>
                )}
              </div>

              {/* Selected service hint */}
              {selectedService && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-xs text-primary font-medium flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    <strong>{selectedService.name}</strong> — avg.{" "}
                    {selectedService.avgDurationMinutes || 10} min per customer
                  </span>
                </div>
              )}

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Name (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && selectedServiceId && !isSubmitting) handleGetTicket()
                  }}
                  className="h-11 rounded-xl border border-outline-variant bg-surface-container text-on-surface focus-visible:ring-2 focus-visible:ring-primary px-4 placeholder:text-on-surface-variant/40"
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleGetTicket}
                disabled={!selectedServiceId || isSubmitting}
                className="w-full h-12 rounded-full text-sm font-extrabold bg-primary text-on-primary hover:opacity-90 shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Ticket...
                  </>
                ) : (
                  "Get My Ticket"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-4">
        <p className="text-[10px] text-on-surface-variant/40">
          Powered by HiQueue &bull; Calm, premium waiting experience
        </p>
      </div>
    </div>
  )
}
