import { NextRequest } from "next/server"
import { getQueueTickets } from "@/server/repositories/ticket.repo"
import { getQueueCounters } from "@/server/repositories/counter.repo"

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

          // Format clean JSON data for frontend consumption
          const payload = {
            tickets,
            counters,
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
        } catch (e) {
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
