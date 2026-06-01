import { NextRequest } from "next/server"
import { getQueueTickets } from "@/server/repositories/ticket.repo"
import { getQueueCounters } from "@/server/repositories/counter.repo"
import { db } from "@/server/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes max duration

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
  const { queueId } = await params

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let lastDataHash = ""
      let isActive = true

      const sendUpdate = async () => {
        if (!isActive) return
        
        try {
          const tickets = await getQueueTickets(queueId)
          const counters = await getQueueCounters(queueId)
          const queue = await db.queue.findUnique({
            where: { id: queueId },
            select: {
              id: true,
              isActive: true,
              services: {
                select: {
                  id: true,
                  name: true,
                  prefix: true,
                  avgDurationMinutes: true,
                  isActive: true,
                },
                orderBy: { name: "asc" },
              },
            },
          })
          const latestCallEvent = await db.ticketEvent.findFirst({
            where: {
              type: "called",
              ticket: {
                queueId,
              },
            },
            select: {
              id: true,
              createdAt: true,
              ticket: {
                select: {
                  id: true,
                  code: true,
                  counterId: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })

          // Format clean JSON data for frontend consumption
          const payload = {
            queue,
            tickets,
            counters,
            latestCallEvent: latestCallEvent
              ? {
                  id: latestCallEvent.id,
                  ticketId: latestCallEvent.ticket.id,
                  ticketCode: latestCallEvent.ticket.code,
                  counterId: latestCallEvent.ticket.counterId,
                  createdAt: latestCallEvent.createdAt,
                }
              : null,
          }
          const currentData = JSON.stringify(payload)

          // Only send if the data has changed
          if (currentData !== lastDataHash) {
            lastDataHash = currentData
            if (isActive) {
              controller.enqueue(encoder.encode(`data: ${currentData}\n\n`))
            }
          }
        } catch (error) {
          console.error("SSE update fetch error:", error)
        }
      }

      // Send keepalive comments to prevent connection timeout
      const sendKeepAlive = () => {
        if (isActive) {
          try {
            controller.enqueue(encoder.encode(`: keepalive\n\n`))
          } catch {
            // Connection might be closed
          }
        }
      }

      // Initial push
      await sendUpdate()

      // Poll interval for data updates
      const dataInterval = setInterval(async () => {
        await sendUpdate()
      }, 2000)

      // Keepalive interval (every 15 seconds)
      const keepAliveInterval = setInterval(() => {
        sendKeepAlive()
      }, 15000)

      // Clean up on disconnect
      request.signal.addEventListener("abort", () => {
        isActive = false
        clearInterval(dataInterval)
        clearInterval(keepAliveInterval)
        try {
          controller.close()
        } catch {
          // controller might already be closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in nginx
    },
  })
}
