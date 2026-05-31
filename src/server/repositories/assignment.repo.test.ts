import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { db } from "@/server/lib/db"
import {
  assignStaffToCounter,
  unassignStaffFromCounter,
  getStaffCounters,
  verifyMembership,
} from "./assignment.repo"

describe("Assignment Repository", () => {
  let testOrgId: string
  let testQueueId: string
  let testCounterId: string
  let testUserId: string

  beforeEach(async () => {
    // Create a test organization with unique slug
    const org = await db.organization.create({
      data: {
        name: "Test Organization",
        slug: `test-org-assignment-repo-${Date.now()}-${Math.random()}`,
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

    // Create a test counter
    const counter = await db.counter.create({
      data: {
        name: "Test Counter",
        queueId: testQueueId,
      },
    })
    testCounterId = counter.id

    // Create a test user
    const user = await db.user.create({
      data: {
        name: "Test Staff",
        email: `test-staff-${Date.now()}-${Math.random()}@example.com`,
        password: "hashedpassword",
      },
    })
    testUserId = user.id

    // Create organization membership for the user
    await db.organizationMembership.create({
      data: {
        userId: testUserId,
        organizationId: testOrgId,
        role: "staff",
      },
    })
  })

  afterEach(async () => {
    // Clean up: delete all test data
    await db.organizationMembership.deleteMany({
      where: { organizationId: testOrgId },
    })
    await db.counter.deleteMany({
      where: { queueId: testQueueId },
    })
    await db.queue.delete({
      where: { id: testQueueId },
    })
    await db.organization.delete({
      where: { id: testOrgId },
    })
    await db.user.delete({
      where: { id: testUserId },
    })
  })

  describe("assignStaffToCounter", () => {
    it("should assign a staff member to a counter", async () => {
      const result = await assignStaffToCounter(testUserId, testCounterId)

      expect(result).toBeDefined()
      expect(result.id).toBe(testCounterId)
      expect(result.assignedStaff).toHaveLength(1)
      expect(result.assignedStaff[0].id).toBe(testUserId)
    })

    it("should allow assigning multiple staff members to the same counter", async () => {
      // Create another user
      const user2 = await db.user.create({
        data: {
          name: "Test Staff 2",
          email: `test-staff-2-${Date.now()}-${Math.random()}@example.com`,
          password: "hashedpassword",
        },
      })

      await db.organizationMembership.create({
        data: {
          userId: user2.id,
          organizationId: testOrgId,
          role: "staff",
        },
      })

      // Assign first staff
      await assignStaffToCounter(testUserId, testCounterId)

      // Assign second staff
      const result = await assignStaffToCounter(user2.id, testCounterId)

      expect(result.assignedStaff).toHaveLength(2)
      expect(result.assignedStaff.map((s) => s.id)).toContain(testUserId)
      expect(result.assignedStaff.map((s) => s.id)).toContain(user2.id)

      // Clean up
      await db.organizationMembership.delete({
        where: {
          userId_organizationId: {
            userId: user2.id,
            organizationId: testOrgId,
          },
        },
      })
      await db.user.delete({
        where: { id: user2.id },
      })
    })

    it("should allow assigning the same staff member to multiple counters", async () => {
      // Create another counter
      const counter2 = await db.counter.create({
        data: {
          name: "Test Counter 2",
          queueId: testQueueId,
        },
      })

      // Assign staff to first counter
      await assignStaffToCounter(testUserId, testCounterId)

      // Assign staff to second counter
      const result = await assignStaffToCounter(testUserId, counter2.id)

      expect(result.assignedStaff).toHaveLength(1)
      expect(result.assignedStaff[0].id).toBe(testUserId)

      // Verify staff is assigned to both counters
      const counters = await getStaffCounters(testUserId)
      expect(counters).toHaveLength(2)

      // Clean up
      await db.counter.delete({
        where: { id: counter2.id },
      })
    })
  })

  describe("unassignStaffFromCounter", () => {
    it("should unassign a staff member from a counter", async () => {
      // First assign the staff
      await assignStaffToCounter(testUserId, testCounterId)

      // Then unassign
      const result = await unassignStaffFromCounter(testUserId, testCounterId)

      expect(result).toBeDefined()
      expect(result.id).toBe(testCounterId)
      expect(result.assignedStaff).toHaveLength(0)
    })

    it("should only unassign the specified staff member", async () => {
      // Create another user
      const user2 = await db.user.create({
        data: {
          name: "Test Staff 2",
          email: `test-staff-2-${Date.now()}-${Math.random()}@example.com`,
          password: "hashedpassword",
        },
      })

      await db.organizationMembership.create({
        data: {
          userId: user2.id,
          organizationId: testOrgId,
          role: "staff",
        },
      })

      // Assign both staff members
      await assignStaffToCounter(testUserId, testCounterId)
      await assignStaffToCounter(user2.id, testCounterId)

      // Unassign only the first staff member
      const result = await unassignStaffFromCounter(testUserId, testCounterId)

      expect(result.assignedStaff).toHaveLength(1)
      expect(result.assignedStaff[0].id).toBe(user2.id)

      // Clean up
      await db.organizationMembership.delete({
        where: {
          userId_organizationId: {
            userId: user2.id,
            organizationId: testOrgId,
          },
        },
      })
      await db.user.delete({
        where: { id: user2.id },
      })
    })
  })

  describe("getStaffCounters", () => {
    it("should return all counters assigned to a staff member", async () => {
      // Assign staff to counter
      await assignStaffToCounter(testUserId, testCounterId)

      const counters = await getStaffCounters(testUserId)

      expect(counters).toHaveLength(1)
      expect(counters[0].id).toBe(testCounterId)
      expect(counters[0].name).toBe("Test Counter")
      expect(counters[0].queue).toBeDefined()
      expect(counters[0].queue.id).toBe(testQueueId)
      expect(counters[0].queue.name).toBe("Test Queue")
      expect(counters[0].queue.organizationId).toBe(testOrgId)
    })

    it("should return empty array if staff has no assigned counters", async () => {
      const counters = await getStaffCounters(testUserId)

      expect(counters).toHaveLength(0)
    })

    it("should return multiple counters if staff is assigned to multiple", async () => {
      // Create another counter
      const counter2 = await db.counter.create({
        data: {
          name: "Test Counter 2",
          queueId: testQueueId,
        },
      })

      // Assign staff to both counters
      await assignStaffToCounter(testUserId, testCounterId)
      await assignStaffToCounter(testUserId, counter2.id)

      const counters = await getStaffCounters(testUserId)

      expect(counters).toHaveLength(2)
      expect(counters.map((c) => c.id)).toContain(testCounterId)
      expect(counters.map((c) => c.id)).toContain(counter2.id)

      // Clean up
      await db.counter.delete({
        where: { id: counter2.id },
      })
    })

    it("should return counters ordered by name", async () => {
      // Create additional counters
      const counterB = await db.counter.create({
        data: {
          name: "Counter B",
          queueId: testQueueId,
        },
      })

      const counterA = await db.counter.create({
        data: {
          name: "Counter A",
          queueId: testQueueId,
        },
      })

      // Assign staff to all counters
      await assignStaffToCounter(testUserId, testCounterId)
      await assignStaffToCounter(testUserId, counterB.id)
      await assignStaffToCounter(testUserId, counterA.id)

      const counters = await getStaffCounters(testUserId)

      expect(counters).toHaveLength(3)
      expect(counters[0].name).toBe("Counter A")
      expect(counters[1].name).toBe("Counter B")
      expect(counters[2].name).toBe("Test Counter")

      // Clean up
      await db.counter.delete({
        where: { id: counterB.id },
      })
      await db.counter.delete({
        where: { id: counterA.id },
      })
    })
  })

  describe("verifyMembership", () => {
    it("should return membership if user is a member of the organization", async () => {
      const membership = await verifyMembership(testUserId, testOrgId)

      expect(membership).toBeDefined()
      expect(membership?.userId).toBe(testUserId)
      expect(membership?.organizationId).toBe(testOrgId)
      expect(membership?.role).toBe("staff")
    })

    it("should return null if user is not a member of the organization", async () => {
      // Create another organization
      const anotherOrg = await db.organization.create({
        data: {
          name: "Another Organization",
          slug: `another-org-${Date.now()}-${Math.random()}`,
        },
      })

      const membership = await verifyMembership(testUserId, anotherOrg.id)

      expect(membership).toBeNull()

      // Clean up
      await db.organization.delete({
        where: { id: anotherOrg.id },
      })
    })

    it("should return null if user does not exist", async () => {
      const membership = await verifyMembership("non-existent-user-id", testOrgId)

      expect(membership).toBeNull()
    })
  })
})
