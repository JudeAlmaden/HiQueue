"use server"

import { createTicketSchema } from "@/server/validators/ticket.validator"
import * as ticketRepo from "@/server/repositories/ticket.repo"
import { getQueueById } from "@/server/repositories/queue.repo"
import { fail, ok, ActionResult } from "@/server/lib/action-utils"

/**
 * Verify a kiosk passcode server-side.
 * The actual passcode is never sent to the client.
 */
export async function verifyKioskPasscodeAction(
  queueId: string,
  enteredPasscode: string
): Promise<ActionResult<boolean>> {
  try {
    const queue = await getQueueById(queueId)
    if (!queue) return fail("Queue not found")

    // No passcode set on this queue — always passes
    if (!queue.passcode) return ok(true)

    if (enteredPasscode === queue.passcode) {
      return ok(true)
    }
    return fail("Incorrect passcode. Please try again.")
  } catch (err) {
    console.error("Failed to verify passcode:", err)
    return fail("Failed to verify passcode")
  }
}

export interface CreateTicketResponse {
  ticket: {
    id: string
    code: string
    number: number
    customerName?: string
    status: string
    createdAt: Date
  }
  waitCount: number
  estimatedWaitTime: number
  queueName: string
  serviceName: string
}

export async function createTicketAction(input: {
  queueId: string
  serviceId: string
  customerName?: string | null
}): Promise<ActionResult<CreateTicketResponse>> {
  const result = createTicketSchema.safeParse(input)

  if (!result.success) {
    return fail(result.error.issues[0].message)
  }

  try {
    const queue = await getQueueById(result.data.queueId)
    if (!queue) {
      return fail("Queue not found")
    }

    if (!queue.isActive) {
      return fail("This queue is currently closed")
    }

    // Passcode is verified client-side via verifyKioskPasscodeAction before ticket creation
    const service = queue.services.find((s) => s.id === result.data.serviceId)
    if (!service) {
      return fail("Service not found")
    }

    if (!service.isActive) {
      return fail("This service is currently closed")
    }

    const ticket = await ticketRepo.createTicket({
      queueId: result.data.queueId,
      serviceId: result.data.serviceId,
      customerName: result.data.customerName ?? undefined,
    })

    // Also get the number of waiting tickets in front of this new ticket
    const waitCount = await ticketRepo.getWaitingTicketsCount(result.data.queueId, ticket.id)

    // Estimate wait time (avgDurationMinutes for the service * waitCount)
    const avgDuration = service?.avgDurationMinutes || 10
    const estimatedWaitTime = waitCount * avgDuration

    return ok({
      ticket: {
        id: ticket.id,
        code: ticket.code,
        number: ticket.number,
        customerName: result.data.customerName || undefined,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
      waitCount,
      estimatedWaitTime,
      queueName: queue.name,
      serviceName: service?.name || "",
    })
  } catch (error) {
    console.error("Failed to create ticket:", error)
    const message = error instanceof Error ? error.message : "Failed to create ticket"
    return fail(message)
  }
}
