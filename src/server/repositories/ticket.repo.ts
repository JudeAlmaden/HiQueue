import { db } from "@/server/lib/db"
import { getBusinessDayBounds } from "@/server/lib/business-day"
import { Prisma } from "@prisma/client"

/**
 * Get or create an open queue session for today.
 * @param queueId - Queue ID
 * @returns Promise resolving to the QueueSession
 */
export async function getOrCreateTodaySession(queueId: string) {
  const { start, end } = getBusinessDayBounds()

  // Find open session for today
  let session = await db.queueSession.findFirst({
    where: {
      queueId,
      status: "open",
      date: {
        gte: start,
        lt: end,
      },
    },
  })

  if (!session) {
    session = await db.queueSession.create({
      data: {
        queueId,
        date: start,
        status: "open",
        currentNumber: 0,
      },
    })
  }

  return session
}

/**
 * Create a new ticket for a specific service in a queue.
 * @param data - Ticket data (queueId, serviceId, customerName)
 * @returns Promise resolving to the created Ticket
 */
export async function createTicket(data: {
  queueId: string
  serviceId: string
  customerName?: string
}) {
  return db.$transaction(async (tx) => {
    // 1. Get queue
    const queue = await tx.queue.findUnique({
      where: { id: data.queueId },
      include: { services: true },
    })

    if (!queue) throw new Error("Queue not found")

    // 2. Get service
    const service = queue.services.find((s) => s.id === data.serviceId)
    if (!service) throw new Error("Service not found")

    // 3. Find open session for today (within transaction)
    const { start, end } = getBusinessDayBounds()

    let session = await tx.queueSession.findFirst({
      where: {
        queueId: data.queueId,
        status: "open",
        date: {
          gte: start,
          lt: end,
        },
      },
    })

    if (!session) {
      session = await tx.queueSession.create({
        data: {
          queueId: data.queueId,
          date: start,
          status: "open",
          currentNumber: 0,
        },
      })
    }

    // 4. Calculate next number for this specific prefix
    // Find the highest number for this prefix in the current session
    const lastTicketWithPrefix = await tx.ticket.findFirst({
      where: {
        queueSessionId: session.id,
        serviceId: data.serviceId,
      },
      orderBy: {
        number: "desc",
      },
      select: {
        number: true,
      },
    })

    const nextNumber = lastTicketWithPrefix ? lastTicketWithPrefix.number + 1 : 1

    // 5. Update session's global counter (for display purposes)
    await tx.queueSession.update({
      where: { id: session.id },
      data: { currentNumber: { increment: 1 } },
    })

    // 6. Generate code (e.g. A001, B001, A002)
    const code = `${service.prefix}${String(nextNumber).padStart(3, "0")}`

    // 7. Create ticket
    return tx.ticket.create({
      data: {
        organizationId: queue.organizationId,
        queueId: data.queueId,
        serviceId: data.serviceId,
        queueSessionId: session.id,
        number: nextNumber,
        code,
        customer: JSON.stringify({ name: data.customerName || undefined }),
        status: "waiting",
        priority: 0,
      },
    })
  })
}

/**
 * Get active tickets (waiting/serving) count for a queue.
 * @param queueId - Queue ID
 * @returns Promise resolving to the count of waiting tickets before the current one
 */
export async function getWaitingTicketsCount(queueId: string, ticketId: string) {
  const currentTicket = await db.ticket.findUnique({
    where: { id: ticketId },
  })

  if (!currentTicket) return 0

  return db.ticket.count({
    where: {
      queueId,
      queueSessionId: currentTicket.queueSessionId,
      status: "waiting",
      createdAt: {
        lt: currentTicket.createdAt,
      },
    },
  })
}

/**
 * Get all tickets for a queue session
 */
export async function getQueueTickets(queueId: string, sessionId?: string) {
  let targetSessionId = sessionId
  if (!targetSessionId) {
    const session = await getOrCreateTodaySession(queueId)
    targetSessionId = session.id
  }

  return db.ticket.findMany({
    where: {
      queueId,
      queueSessionId: targetSessionId,
    },
    include: {
      service: true,
      counter: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })
}

/**
 * Gets the oldest waiting ticket (optionally filtered by serviceIds)
 */
export async function getNextWaitingTicket(queueId: string, serviceIds?: string[]) {
  const todaySession = await getOrCreateTodaySession(queueId)
  
  const whereClause: Prisma.TicketWhereInput = {
    queueId,
    queueSessionId: todaySession.id,
    status: "waiting",
  }

  if (serviceIds && serviceIds.length > 0) {
    whereClause.serviceId = { in: serviceIds }
  }

  return db.ticket.findFirst({
    where: whereClause,
    orderBy: [
      { priority: "desc" },
      { createdAt: "asc" },
    ],
  })
}

/**
 * Calls a ticket at a counter
 */
export async function callTicket(ticketId: string, counterId: string) {
  return db.$transaction(async (tx) => {
    const counter = await tx.counter.findUnique({
      where: { id: counterId },
      include: {
        currentTicket: {
          select: {
            id: true,
            queueSessionId: true,
            status: true,
          },
        },
      },
    })
    if (!counter) throw new Error("Counter not found")

    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
    })
    if (!ticket) throw new Error("Ticket not found")
    if (ticket.queueId !== counter.queueId) {
      throw new Error("Ticket does not belong to this counter's queue")
    }
    if (ticket.status !== "waiting" && ticket.status !== "hold") {
      throw new Error("Ticket is not in waiting or hold status")
    }

    const { start, end } = getBusinessDayBounds()
    const todaySession = await tx.queueSession.findFirst({
      where: {
        queueId: ticket.queueId,
        status: "open",
        date: {
          gte: start,
          lt: end,
        },
      },
      select: { id: true },
    })

    if (ticket.queueSessionId !== todaySession?.id) {
      throw new Error("Ticket is not part of the current queue session")
    }

    if (counter.currentTicketId) {
      const isServingCurrentSessionTicket =
        counter.currentTicket?.status === "serving" &&
        counter.currentTicket.queueSessionId === ticket.queueSessionId

      if (isServingCurrentSessionTicket) {
        throw new Error("Counter is currently serving another ticket")
      }

      await tx.counter.update({
        where: { id: counterId },
        data: { currentTicketId: null },
      })
    }

    // Update ticket
    const updatedTicket = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: "serving",
        counterId,
        calledAt: new Date(),
        startedAt: new Date(),
      },
    })

    // Update counter
    await tx.counter.update({
      where: { id: counterId },
      data: {
        currentTicketId: ticketId,
      },
    })

    // Log event
    await tx.ticketEvent.create({
      data: {
        ticketId,
        type: "called",
        meta: JSON.stringify({ counterId, counterName: counter.name }),
      },
    })

    return updatedTicket
  })
}

/**
 * Marks serving ticket as completed (done)
 */
export async function completeTicket(ticketId: string, counterId: string) {
  return db.$transaction(async (tx) => {
    const counter = await tx.counter.findUnique({
      where: { id: counterId },
    })
    if (!counter) throw new Error("Counter not found")

    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
    })
    if (!ticket) throw new Error("Ticket not found")
    if (ticket.queueId !== counter.queueId) {
      throw new Error("Ticket does not belong to this counter's queue")
    }
    if (ticket.status !== "serving") {
      throw new Error("Ticket is not currently being served")
    }

    // Update ticket
    const updatedTicket = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: "done",
        completedAt: new Date(),
      },
    })

    // Update counter if it was serving this ticket
    if (counter.currentTicketId === ticketId) {
      await tx.counter.update({
        where: { id: counterId },
        data: {
          currentTicketId: null,
        },
      })
    }

    // Log event
    await tx.ticketEvent.create({
      data: {
        ticketId,
        type: "completed",
        meta: JSON.stringify({ counterId, counterName: counter.name }),
      },
    })

    return updatedTicket
  })
}

/**
 * Puts current serving ticket on hold
 */
export async function holdTicket(ticketId: string, counterId: string) {
  return db.$transaction(async (tx) => {
    const counter = await tx.counter.findUnique({
      where: { id: counterId },
    })
    if (!counter) throw new Error("Counter not found")

    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
    })
    if (!ticket) throw new Error("Ticket not found")
    if (ticket.queueId !== counter.queueId) {
      throw new Error("Ticket does not belong to this counter's queue")
    }
    if (ticket.status !== "serving") {
      throw new Error("Ticket is not currently being served")
    }

    // Update ticket
    const updatedTicket = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: "hold",
      },
    })

    // Update counter if serving this ticket
    if (counter.currentTicketId === ticketId) {
      await tx.counter.update({
        where: { id: counterId },
        data: {
          currentTicketId: null,
        },
      })
    }

    // Log event
    await tx.ticketEvent.create({
      data: {
        ticketId,
        type: "hold",
        meta: JSON.stringify({ counterId, counterName: counter.name }),
      },
    })

    return updatedTicket
  })
}

/**
 * Recalls a ticket from hold back to serving
 */
export async function recallFromHold(ticketId: string, counterId: string) {
  return db.$transaction(async (tx) => {
    const counter = await tx.counter.findUnique({
      where: { id: counterId },
      include: {
        currentTicket: {
          select: {
            id: true,
            queueSessionId: true,
            status: true,
          },
        },
      },
    })
    if (!counter) throw new Error("Counter not found")

    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
    })
    if (!ticket) throw new Error("Ticket not found")
    if (ticket.queueId !== counter.queueId) {
      throw new Error("Ticket does not belong to this counter's queue")
    }
    if (ticket.status !== "hold") {
      throw new Error("Ticket is not on hold")
    }

    const { start, end } = getBusinessDayBounds()
    const todaySession = await tx.queueSession.findFirst({
      where: {
        queueId: ticket.queueId,
        status: "open",
        date: {
          gte: start,
          lt: end,
        },
      },
      select: { id: true },
    })

    if (ticket.queueSessionId !== todaySession?.id) {
      throw new Error("Ticket is not part of the current queue session")
    }

    if (counter.currentTicketId) {
      const isServingCurrentSessionTicket =
        counter.currentTicket?.status === "serving" &&
        counter.currentTicket.queueSessionId === ticket.queueSessionId

      if (isServingCurrentSessionTicket) {
        throw new Error("Counter is currently serving another ticket")
      }

      await tx.counter.update({
        where: { id: counterId },
        data: { currentTicketId: null },
      })
    }

    // Update ticket
    const updatedTicket = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: "serving",
        counterId,
      },
    })

    // Update counter
    await tx.counter.update({
      where: { id: counterId },
      data: {
        currentTicketId: ticketId,
      },
    })

    // Log event
    await tx.ticketEvent.create({
      data: {
        ticketId,
        type: "resumed",
        meta: JSON.stringify({ counterId, counterName: counter.name }),
      },
    })

    return updatedTicket
  })
}

/**
 * Marks serving ticket as no-show
 */
export async function noShowTicket(ticketId: string, counterId: string) {
  return db.$transaction(async (tx) => {
    const counter = await tx.counter.findUnique({
      where: { id: counterId },
    })
    if (!counter) throw new Error("Counter not found")

    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
    })
    if (!ticket) throw new Error("Ticket not found")
    if (ticket.queueId !== counter.queueId) {
      throw new Error("Ticket does not belong to this counter's queue")
    }
    if (ticket.status !== "serving") {
      throw new Error("Ticket is not currently being served")
    }

    // Update ticket
    const updatedTicket = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: "no_show",
      },
    })

    // Update counter if serving this ticket
    if (counter.currentTicketId === ticketId) {
      await tx.counter.update({
        where: { id: counterId },
        data: {
          currentTicketId: null,
        },
      })
    }

    // Log event
    await tx.ticketEvent.create({
      data: {
        ticketId,
        type: "no_show",
        meta: JSON.stringify({ counterId, counterName: counter.name }),
      },
    })

    return updatedTicket
  })
}

/**
 * Skips a ticket (either waiting or serving)
 */
export async function skipTicket(ticketId: string, counterId: string) {
  return db.$transaction(async (tx) => {
    const counter = await tx.counter.findUnique({
      where: { id: counterId },
    })
    if (!counter) throw new Error("Counter not found")

    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
    })
    if (!ticket) throw new Error("Ticket not found")
    if (ticket.queueId !== counter.queueId) {
      throw new Error("Ticket does not belong to this counter's queue")
    }

    // Update ticket
    const updatedTicket = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: "skipped",
      },
    })

    // Update counter if serving this ticket
    if (counter.currentTicketId === ticketId) {
      await tx.counter.update({
        where: { id: counterId },
        data: {
          currentTicketId: null,
        },
      })
    }

    // Log event
    await tx.ticketEvent.create({
      data: {
        ticketId,
        type: "skipped",
        meta: JSON.stringify({ counterId, counterName: counter.name }),
      },
    })

    return updatedTicket
  })
}

