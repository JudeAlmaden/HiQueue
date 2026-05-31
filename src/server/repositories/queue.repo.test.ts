import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { db } from "@/server/lib/db"
import {
  createQueue,
  updateQueue,
  deleteQueue,
  getOrganizationQueues,
  getQueueById,
  countActiveTickets,
} from "./queue.repo"

describe("Queue Repository", () => {
  let testOrgId: string

  beforeEach(async () => {
    // Create a test organization with unique slug
    const org = await db.organization.create({
      data: {
        name: "Test Organization",
        slug: `test-org-queue-repo-${Date.now()}-${Math.random()}`,
      },
    })
    testOrgId = org.id
  })

  afterEach(async () => {
    // Clean up: delete all tickets, services, counters, queue sessions, queues, and organization
    await db.ticket.deleteMany({
      where: { organizationId: testOrgId },
    })
    await db.service.deleteMany({
      where: { queue: { organizationId: testOrgId } },
    })
    await db.counter.deleteMany({
      where: { queue: { organizationId: testOrgId } },
    })
    await db.queueSession.deleteMany({
      where: { queue: { organizationId: testOrgId } },
    })
    await db.queue.deleteMany({
      where: { organizationId: testOrgId },
    })
    await db.organization.delete({
      where: { id: testOrgId },
    })
  })

  describe("createQueue", () => {
    it("should create a queue with default theme and layout", async () => {
      const queue = await createQueue({
        name: "Test Queue",
        description: "A test queue",
        organizationId: testOrgId,
      })

      expect(queue).toBeDefined()
      expect(queue.name).toBe("Test Queue")
      expect(queue.description).toBe("A test queue")
      expect(queue.organizationId).toBe(testOrgId)
      expect(queue.theme).toBe("{}")
      expect(queue.layout).toBe("{}")
      expect(queue.isActive).toBe(true)
    })

    it("should create a queue with optional passcode", async () => {
      const queue = await createQueue({
        name: "Secure Queue",
        passcode: "1234",
        organizationId: testOrgId,
      })

      expect(queue.passcode).toBe("1234")
    })
  })

  describe("updateQueue", () => {
    it("should update queue name and description", async () => {
      const queue = await createQueue({
        name: "Original Name",
        organizationId: testOrgId,
      })

      const updated = await updateQueue(queue.id, {
        name: "Updated Name",
        description: "Updated description",
      })

      expect(updated.name).toBe("Updated Name")
      expect(updated.description).toBe("Updated description")
    })

    it("should update theme and layout as JSON strings", async () => {
      const queue = await createQueue({
        name: "Theme Queue",
        organizationId: testOrgId,
      })

      const theme = { primaryColor: "blue" }
      const layout = { columns: 3 }

      const updated = await updateQueue(queue.id, {
        theme,
        layout,
      })

      expect(updated.theme).toBe(JSON.stringify(theme))
      expect(updated.layout).toBe(JSON.stringify(layout))
    })

    it("should allow setting passcode to null", async () => {
      const queue = await createQueue({
        name: "Queue with Passcode",
        passcode: "1234",
        organizationId: testOrgId,
      })

      const updated = await updateQueue(queue.id, {
        passcode: null,
      })

      expect(updated.passcode).toBeNull()
    })
  })

  describe("deleteQueue", () => {
    it("should delete a queue", async () => {
      const queue = await createQueue({
        name: "Queue to Delete",
        organizationId: testOrgId,
      })

      await deleteQueue(queue.id)

      const found = await db.queue.findUnique({
        where: { id: queue.id },
      })

      expect(found).toBeNull()
    })
  })

  describe("getOrganizationQueues", () => {
    it("should return all queues for an organization", async () => {
      await createQueue({
        name: "Queue 1",
        organizationId: testOrgId,
      })

      await createQueue({
        name: "Queue 2",
        organizationId: testOrgId,
      })

      const queues = await getOrganizationQueues(testOrgId)

      expect(queues).toHaveLength(2)
      expect(queues[0].name).toBe("Queue 1")
      expect(queues[1].name).toBe("Queue 2")
    })

    it("should return empty array if no queues exist", async () => {
      const queues = await getOrganizationQueues(testOrgId)

      expect(queues).toHaveLength(0)
    })
  })

  describe("getQueueById", () => {
    it("should return queue with related data", async () => {
      const queue = await createQueue({
        name: "Queue with Relations",
        organizationId: testOrgId,
      })

      // Create a service for the queue
      await db.service.create({
        data: {
          name: "Test Service",
          prefix: "TS",
          queueId: queue.id,
        },
      })

      // Create a counter for the queue
      await db.counter.create({
        data: {
          name: "Counter 1",
          queueId: queue.id,
        },
      })

      const result = await getQueueById(queue.id)

      expect(result).toBeDefined()
      expect(result?.name).toBe("Queue with Relations")
      expect(result?.services).toHaveLength(1)
      expect(result?.services[0].name).toBe("Test Service")
      expect(result?.counters).toHaveLength(1)
      expect(result?.counters[0].name).toBe("Counter 1")
      expect(result?.organization.name).toBe("Test Organization")
    })

    it("should return null if queue does not exist", async () => {
      const result = await getQueueById("non-existent-id")

      expect(result).toBeNull()
    })
  })

  describe("countActiveTickets", () => {
    it("should count waiting and serving tickets", async () => {
      const queue = await createQueue({
        name: "Queue with Tickets",
        organizationId: testOrgId,
      })

      const service = await db.service.create({
        data: {
          name: "Test Service",
          prefix: "TS",
          queueId: queue.id,
        },
      })

      const session = await db.queueSession.create({
        data: {
          queueId: queue.id,
          date: new Date(),
        },
      })

      // Create waiting tickets
      await db.ticket.create({
        data: {
          organizationId: testOrgId,
          queueId: queue.id,
          serviceId: service.id,
          queueSessionId: session.id,
          number: 1,
          code: "TS001",
          status: "waiting",
        },
      })

      await db.ticket.create({
        data: {
          organizationId: testOrgId,
          queueId: queue.id,
          serviceId: service.id,
          queueSessionId: session.id,
          number: 2,
          code: "TS002",
          status: "serving",
        },
      })

      // Create completed ticket (should not be counted)
      await db.ticket.create({
        data: {
          organizationId: testOrgId,
          queueId: queue.id,
          serviceId: service.id,
          queueSessionId: session.id,
          number: 3,
          code: "TS003",
          status: "done",
        },
      })

      const count = await countActiveTickets(queue.id)

      expect(count).toBe(2)
    })

    it("should return 0 if no active tickets exist", async () => {
      const queue = await createQueue({
        name: "Empty Queue",
        organizationId: testOrgId,
      })

      const count = await countActiveTickets(queue.id)

      expect(count).toBe(0)
    })
  })
})
