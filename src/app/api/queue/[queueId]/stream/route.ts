import { NextRequest } from "next/server"
import { getQueueTickets } from "@/server/repositories/ticket.repo"
import { getQueueCounters } from "@/server/repositories/counter.repo"
import { db } from "@/server/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
  const { queueId } = await params

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let lastDataHash = ""

      const sendUpdate = async () => {
        try {
          const tickets = await getQueueTickets(queueId)
          const counters = await getQueueCounters(queueId)
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
            controller.enqueue(encoder.encode(`data: ${currentData}\n\n`))
          }
        } catch (error) {
          console.error("SSE update fetch error:", error)
        }
      }

      // Initial push
      await sendUpdate()

      // Poll interval
      const interval = setInterval(async () => {
        await sendUpdate()
      }, 2000)

      // Clean up on disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
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
    },
  })
}
