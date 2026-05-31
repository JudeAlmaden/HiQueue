"use server"

import { auth } from "@/auth"
import { fail, ok, ActionResult } from "@/server/lib/action-utils"
import { getCounterById, getAssignedStaff } from "@/server/repositories/counter.repo"
import * as ticketRepo from "@/server/repositories/ticket.repo"
import { db } from "@/server/lib/db"
import { revalidatePath } from "next/cache"

async function verifyCounterStaff(counterId: string) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false as const, error: "Unauthorized" }

  const counter = await getCounterById(counterId)
  if (!counter) return { success: false as const, error: "Counter not found" }

  const assignedStaff = await getAssignedStaff(counterId)
  const isAssigned = assignedStaff.some((staff) => staff.id === userId)

  const queue = await db.queue.findUnique({
    where: { id: counter.queueId },
    include: { organization: true },
  })

  let isOrgMember = false
  if (queue) {
    const membership = await db.organizationMembership.findFirst({
      where: {
        userId,
        organizationId: queue.organizationId,
      },
    })
    if (membership) {
      isOrgMember = true
    }
  }

  if (!isAssigned && !isOrgMember) {
    return { success: false as const, error: "You are not assigned to this counter" }
  }

  return { success: true as const, counter, queue, userId }
}

export async function callNextTicketAction(
  counterId: string,
  serviceId?: string
): Promise<ActionResult<any>> {
  try {
    const verification = await verifyCounterStaff(counterId)
    if (!verification.success) return fail(verification.error)
    const { counter, queue } = verification

    let serviceIds = counter.services.map((s) => s.id)
    if (serviceId) {
      if (!serviceIds.includes(serviceId)) {
        return fail("Selected service is not assigned to this counter")
      }
      serviceIds = [serviceId]
    }

    const ticket = await ticketRepo.getNextWaitingTicket(counter.queueId, serviceIds)
    if (!ticket) {
      return fail("No waiting tickets in the queue")
    }

    const updatedTicket = await ticketRepo.callTicket(ticket.id, counterId)

    if (queue) {
      revalidatePath(`/org/${queue.organization.slug}/counter/${counterId}`)
    }

    return ok(updatedTicket)
  } catch (error: any) {
    console.error("Failed to call next ticket:", error)
    return fail(error.message || "Failed to call next ticket")
  }
}

export async function callSpecificTicketAction(
  ticketId: string,
  counterId: string
): Promise<ActionResult<any>> {
  try {
    const verification = await verifyCounterStaff(counterId)
    if (!verification.success) return fail(verification.error)
    const { queue } = verification

    const updatedTicket = await ticketRepo.callTicket(ticketId, counterId)

    if (queue) {
      revalidatePath(`/org/${queue.organization.slug}/counter/${counterId}`)
    }

    return ok(updatedTicket)
  } catch (error: any) {
    console.error("Failed to call ticket:", error)
    return fail(error.message || "Failed to call ticket")
  }
}

export async function completeCurrentTicketAction(counterId: string): Promise<ActionResult<any>> {
  try {
    const verification = await verifyCounterStaff(counterId)
    if (!verification.success) return fail(verification.error)
    const { counter, queue } = verification

    if (!counter.currentTicketId) {
      return fail("No ticket is currently being served at this counter")
    }

    const updatedTicket = await ticketRepo.completeTicket(counter.currentTicketId, counterId)

    if (queue) {
      revalidatePath(`/org/${queue.organization.slug}/counter/${counterId}`)
    }

    return ok(updatedTicket)
  } catch (error: any) {
    console.error("Failed to complete ticket:", error)
    return fail(error.message || "Failed to complete ticket")
  }
}

export async function holdCurrentTicketAction(counterId: string): Promise<ActionResult<any>> {
  try {
    const verification = await verifyCounterStaff(counterId)
    if (!verification.success) return fail(verification.error)
    const { counter, queue } = verification

    if (!counter.currentTicketId) {
      return fail("No ticket is currently being served at this counter")
    }

    const updatedTicket = await ticketRepo.holdTicket(counter.currentTicketId, counterId)

    if (queue) {
      revalidatePath(`/org/${queue.organization.slug}/counter/${counterId}`)
    }

    return ok(updatedTicket)
  } catch (error: any) {
    console.error("Failed to hold ticket:", error)
    return fail(error.message || "Failed to hold ticket")
  }
}

export async function recallFromHoldAction(
  ticketId: string,
  counterId: string
): Promise<ActionResult<any>> {
  try {
    const verification = await verifyCounterStaff(counterId)
    if (!verification.success) return fail(verification.error)
    const { queue } = verification

    const updatedTicket = await ticketRepo.recallFromHold(ticketId, counterId)

    if (queue) {
      revalidatePath(`/org/${queue.organization.slug}/counter/${counterId}`)
    }

    return ok(updatedTicket)
  } catch (error: any) {
    console.error("Failed to recall ticket from hold:", error)
    return fail(error.message || "Failed to recall ticket from hold")
  }
}

export async function noShowAction(counterId: string): Promise<ActionResult<any>> {
  try {
    const verification = await verifyCounterStaff(counterId)
    if (!verification.success) return fail(verification.error)
    const { counter, queue } = verification

    if (!counter.currentTicketId) {
      return fail("No ticket is currently being served at this counter")
    }

    const updatedTicket = await ticketRepo.noShowTicket(counter.currentTicketId, counterId)

    if (queue) {
      revalidatePath(`/org/${queue.organization.slug}/counter/${counterId}`)
    }

    return ok(updatedTicket)
  } catch (error: any) {
    console.error("Failed to mark ticket as no-show:", error)
    return fail(error.message || "Failed to mark ticket as no-show")
  }
}

export async function skipTicketAction(
  ticketId: string,
  counterId: string
): Promise<ActionResult<any>> {
  try {
    const verification = await verifyCounterStaff(counterId)
    if (!verification.success) return fail(verification.error)
    const { queue } = verification

    const updatedTicket = await ticketRepo.skipTicket(ticketId, counterId)

    if (queue) {
      revalidatePath(`/org/${queue.organization.slug}/counter/${counterId}`)
    }

    return ok(updatedTicket)
  } catch (error: any) {
    console.error("Failed to skip ticket:", error)
    return fail(error.message || "Failed to skip ticket")
  }
}
