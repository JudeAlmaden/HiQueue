import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { db } from "@/server/lib/db"
import {
  createCounter,
  updateCounter,
  deleteCounter,
  getQueueCounters,
  findCounterByName,
  getAssignedStaff,
  hasAssignedStaff,
} from "./counter.repo"

describe("Counter Repository", () => {
  let testOrgId: string
  let testQueueId: string

  beforeEach(async () => {
    // Create a test organization with unique slug
    const org = await db.organization.create({
      data: {
        name: "Test Organization",
        slug: `test-org-counter-repo-${Date.now()}-${Math.random()}`,
      },
    })
    testOrgId = org.id

    // Create a test queue
    const queue = await db.queue.create({
      data: {
        name: "Test Queue",
        organizationId: testOrgId,
      },
    })
    testQueueId = queue.id
  })

  afterEach(async () => {
    // Clean up: delete all counters, queues, and organization
    await db.counter.deleteMany({
      where: { queueId: testQueueId },
    })
    await db.queue.delete({
      where: { id: testQueueId },
    })
    await db.organization.delete({
      where: { id: testOrgId },
    })
  })

  describe("createCounter", () => {
    it("should create a counter with default values", async () => {
      const counter = await createCounter({
        name: "Counter 1",
        queueId: testQueueId,
      })

      expect(counter).toBeDefined()
      expect(counter.name).toBe("Counter 1")
      expect(counter.queueId).toBe(testQueueId)
      expect(counter.currentTicketId).toBeNull()
      expect(counter.isActive).toBe(true)
    })

    it("should create a counter with associated service IDs", async () => {
      const srv1 = await db.service.create({
        data: { name: "Service 1", prefix: "S1", queueId: testQueueId }
      })
      const srv2 = await db.service.create({
        data: { name: "Service 2", prefix: "S2", queueId: testQueueId }
      })

      const counter = await createCounter({
        name: "Multi-Service Counter",
        queueId: testQueueId,
        serviceIds: [srv1.id, srv2.id],
      })

      expect(counter).toBeDefined()
      expect(counter.name).toBe("Multi-Service Counter")
      expect(counter.services).toBeDefined()
      expect(counter.services).toHaveLength(2)
      expect(counter.services?.map(s => s.id)).toContain(srv1.id)
      expect(counter.services?.map(s => s.id)).toContain(srv2.id)

      // clean up services
      await db.service.deleteMany({ where: { queueId: testQueueId } })
    })

    it("should create multiple counters for the same queue", async () => {
      const counter1 = await createCounter({
        name: "Counter 1",
        queueId: testQueueId,
      })

      const counter2 = await createCounter({
        name: "Counter 2",
        queueId: testQueueId,
      })

      expect(counter1.id).not.toBe(counter2.id)
      expect(counter1.queueId).toBe(testQueueId)
      expect(counter2.queueId).toBe(testQueueId)
    })
  })

  describe("updateCounter", () => {
    it("should update counter name", async () => {
      const counter = await createCounter({
        name: "Original Name",
        queueId: testQueueId,
      })

      const updated = await updateCounter(counter.id, {
        name: "Updated Name",
      })

      expect(updated.name).toBe("Updated Name")
      expect(updated.id).toBe(counter.id)
    })

    it("should update a counter's associated service IDs", async () => {
      const srv1 = await db.service.create({
        data: { name: "Service 1", prefix: "S1", queueId: testQueueId }
      })
      const srv2 = await db.service.create({
        data: { name: "Service 2", prefix: "S2", queueId: testQueueId }
      })

      const counter = await createCounter({
        name: "Original Counter",
        queueId: testQueueId,
        serviceIds: [srv1.id],
      })

      expect(counter.services).toHaveLength(1)

      const updated = await updateCounter(counter.id, {
        name: "Updated Counter",
        serviceIds: [srv2.id],
      })

      expect(updated.name).toBe("Updated Counter")
      expect(updated.services).toBeDefined()
      expect(updated.services).toHaveLength(1)
      expect(updated.services?.[0].id).toBe(srv2.id)

      // clean up services
      await db.service.deleteMany({ where: { queueId: testQueueId } })
    })
  })

  describe("deleteCounter", () => {
    it("should delete a counter", async () => {
      const counter = await createCounter({
        name: "Counter to Delete",
        queueId: testQueueId,
      })

      await deleteCounter(counter.id)

      const found = await db.counter.findUnique({
        where: { id: counter.id },
      })

      expect(found).toBeNull()
    })
  })

  describe("getQueueCounters", () => {
    it("should return all counters for a queue ordered by name", async () => {
      await createCounter({
        name: "Counter B",
        queueId: testQueueId,
      })

      await createCounter({
        name: "Counter A",
        queueId: testQueueId,
      })

      await createCounter({
        name: "Counter C",
        queueId: testQueueId,
      })

      const counters = await getQueueCounters(testQueueId)

      expect(counters).toHaveLength(3)
      expect(counters[0].name).toBe("Counter A")
      expect(counters[1].name).toBe("Counter B")
      expect(counters[2].name).toBe("Counter C")
    })

    it("should return empty array if no counters exist", async () => {
      const counters = await getQueueCounters(testQueueId)

      expect(counters).toHaveLength(0)
    })

    it("should only return counters for the specified queue", async () => {
      // Create another queue
      const anotherQueue = await db.queue.create({
        data: {
          name: "Another Queue",
          organizationId: testOrgId,
        },
      })

      await createCounter({
        name: "Counter 1",
        queueId: testQueueId,
      })

      await createCounter({
        name: "Counter 2",
        queueId: anotherQueue.id,
      })

      const counters = await getQueueCounters(testQueueId)

      expect(counters).toHaveLength(1)
      expect(counters[0].name).toBe("Counter 1")

      // Clean up
      await db.counter.deleteMany({
        where: { queueId: anotherQueue.id },
      })
      await db.queue.delete({
        where: { id: anotherQueue.id },
      })
    })
  })

  describe("findCounterByName", () => {
    it("should find a counter by name in a specific queue", async () => {
      const counter = await createCounter({
        name: "Unique Counter",
        queueId: testQueueId,
      })

      const found = await findCounterByName("Unique Counter", testQueueId)

      expect(found).toBeDefined()
      expect(found?.id).toBe(counter.id)
      expect(found?.name).toBe("Unique Counter")
    })

    it("should return null if counter does not exist", async () => {
      const found = await findCounterByName("Non-existent Counter", testQueueId)

      expect(found).toBeNull()
    })

    it("should only find counters in the specified queue", async () => {
      // Create another queue
      const anotherQueue = await db.queue.create({
        data: {
          name: "Another Queue",
          organizationId: testOrgId,
        },
      })

      await createCounter({
        name: "Counter 1",
        queueId: testQueueId,
      })

      await createCounter({
        name: "Counter 1",
        queueId: anotherQueue.id,
      })

      const found = await findCounterByName("Counter 1", testQueueId)

      expect(found).toBeDefined()
      expect(found?.queueId).toBe(testQueueId)

      // Clean up
      await db.counter.deleteMany({
        where: { queueId: anotherQueue.id },
      })
      await db.queue.delete({
        where: { id: anotherQueue.id },
      })
    })
  })

  describe("getAssignedStaff", () => {
    it("should return empty array (placeholder until schema is updated)", async () => {
      const counter = await createCounter({
        name: "Counter 1",
        queueId: testQueueId,
      })

      const staff = await getAssignedStaff(counter.id)

      expect(staff).toEqual([])
    })
  })

  describe("hasAssignedStaff", () => {
    it("should return false (placeholder until schema is updated)", async () => {
      const counter = await createCounter({
        name: "Counter 1",
        queueId: testQueueId,
      })

      const hasStaff = await hasAssignedStaff(counter.id)

      expect(hasStaff).toBe(false)
    })
  })
})
