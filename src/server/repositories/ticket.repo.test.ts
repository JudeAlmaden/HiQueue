import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { db } from "@/server/lib/db"
import { createTicket, getWaitingTicketsCount } from "./ticket.repo"

describe("Ticket Repository", () => {
  let testOrgId: string
  let testQueueId: string
  let testServiceId: string

  beforeEach(async () => {
    const org = await db.organization.create({
      data: {
        name: "Ticket Test Org",
        slug: `ticket-test-org-${Date.now()}-${Math.random()}`,
      },
    })
    testOrgId = org.id

    const queue = await db.queue.create({
      data: {
        name: "Test Queue",
        organizationId: testOrgId,
        theme: "{}",
        layout: "{}",
        isActive: true,
      },
    })
    testQueueId = queue.id

    const service = await db.service.create({
      data: {
        name: "General",
        prefix: "G",
        queueId: testQueueId,
        isActive: true,
      },
    })
    testServiceId = service.id
  })

  afterEach(async () => {
    await db.ticketEvent.deleteMany({ where: { ticket: { organizationId: testOrgId } } })
    await db.ticket.deleteMany({ where: { organizationId: testOrgId } })
    await db.queueSession.deleteMany({ where: { queue: { organizationId: testOrgId } } })
    await db.service.deleteMany({ where: { queue: { organizationId: testOrgId } } })
    await db.queue.deleteMany({ where: { organizationId: testOrgId } })
    await db.organization.delete({ where: { id: testOrgId } })
  })

  // ── createTicket ─────────────────────────────────────────────────────────

  describe("createTicket", () => {
    it("creates a ticket with correct code format", async () => {
      const ticket = await createTicket({ queueId: testQueueId, serviceId: testServiceId })

      expect(ticket.code).toBe("G001")
      expect(ticket.number).toBe(1)
      expect(ticket.status).toBe("waiting")
      expect(ticket.queueId).toBe(testQueueId)
      expect(ticket.serviceId).toBe(testServiceId)
      expect(ticket.organizationId).toBe(testOrgId)
    })

    it("increments ticket numbers sequentially", async () => {
      const t1 = await createTicket({ queueId: testQueueId, serviceId: testServiceId })
      const t2 = await createTicket({ queueId: testQueueId, serviceId: testServiceId })
      const t3 = await createTicket({ queueId: testQueueId, serviceId: testServiceId })

      expect(t1.code).toBe("G001")
      expect(t2.code).toBe("G002")
      expect(t3.code).toBe("G003")
      expect(t1.number).toBe(1)
      expect(t2.number).toBe(2)
      expect(t3.number).toBe(3)
    })

    it("stores customer name in JSON customer field", async () => {
      const ticket = await createTicket({
        queueId: testQueueId,
        serviceId: testServiceId,
        customerName: "Maria Santos",
      })

      const customer = JSON.parse(ticket.customer)
      expect(customer.name).toBe("Maria Santos")
    })

    it("creates ticket without customer name", async () => {
      const ticket = await createTicket({ queueId: testQueueId, serviceId: testServiceId })
      const customer = JSON.parse(ticket.customer)
      expect(customer.name).toBeUndefined()
    })

    it("creates a queue session automatically if none exists for today", async () => {
      await createTicket({ queueId: testQueueId, serviceId: testServiceId })

      const session = await db.queueSession.findFirst({
        where: { queueId: testQueueId, status: "open" },
      })

      expect(session).not.toBeNull()
      expect(session?.currentNumber).toBe(1)
    })

    it("reuses the existing open session for today", async () => {
      await createTicket({ queueId: testQueueId, serviceId: testServiceId })
      await createTicket({ queueId: testQueueId, serviceId: testServiceId })

      const sessions = await db.queueSession.findMany({
        where: { queueId: testQueueId },
      })

      expect(sessions).toHaveLength(1)
      expect(sessions[0].currentNumber).toBe(2)
    })

    it("throws if queue does not exist", async () => {
      await expect(
        createTicket({ queueId: "non-existent-queue-id", serviceId: testServiceId })
      ).rejects.toThrow("Queue not found")
    })

    it("throws if service does not belong to the queue", async () => {
      const otherQueue = await db.queue.create({
        data: {
          name: "Other Queue",
          organizationId: testOrgId,
          theme: "{}",
          layout: "{}",
          isActive: true,
        },
      })

      await expect(
        createTicket({ queueId: otherQueue.id, serviceId: testServiceId })
      ).rejects.toThrow("Service not found")

      // Cleanup
      await db.queue.delete({ where: { id: otherQueue.id } })
    })
  })

  // ── getWaitingTicketsCount ────────────────────────────────────────────────

  describe("getWaitingTicketsCount", () => {
    it("returns count of waiting tickets created before the given ticket", async () => {
      const t1 = await createTicket({ queueId: testQueueId, serviceId: testServiceId })
      const t2 = await createTicket({ queueId: testQueueId, serviceId: testServiceId })
      const t3 = await createTicket({ queueId: testQueueId, serviceId: testServiceId })

      // t3 should have 2 tickets ahead (t1 and t2)
      const count = await getWaitingTicketsCount(testQueueId, t3.id)
      expect(count).toBe(2)
    })

    it("returns 0 for the first ticket in the queue", async () => {
      const t1 = await createTicket({ queueId: testQueueId, serviceId: testServiceId })
      const count = await getWaitingTicketsCount(testQueueId, t1.id)
      expect(count).toBe(0)
    })

    it("excludes tickets with non-waiting statuses from the count", async () => {
      const t1 = await createTicket({ queueId: testQueueId, serviceId: testServiceId })
      const t2 = await createTicket({ queueId: testQueueId, serviceId: testServiceId })

      // Mark t1 as "serving" (it left the waiting state)
      await db.ticket.update({ where: { id: t1.id }, data: { status: "serving" } })

      const count = await getWaitingTicketsCount(testQueueId, t2.id)
      expect(count).toBe(0)
    })

    it("returns 0 for a non-existent ticket ID", async () => {
      const count = await getWaitingTicketsCount(testQueueId, "non-existent-id")
      expect(count).toBe(0)
    })
  })
})
