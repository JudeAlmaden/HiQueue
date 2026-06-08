import { describe, it, expect, beforeEach, vi } from "vitest"
import * as queueService from "../queue.service"
import * as queueRepo from "@/server/repositories/queue.repo"
import { db } from "@/server/lib/db"

vi.mock("@/server/repositories/queue.repo")
vi.mock("@/server/lib/db", () => ({
  db: {
    organizationMembership: {
      findUnique: vi.fn(),
    },
    queue: {
      findUnique: vi.fn(),
    },
  },
}))

describe("QueueService", () => {
  const mockUserId = "user-123"
  const mockOrgId = "org-123"
  const mockQueueId = "queue-123"

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createQueue", () => {
    const validInput = {
      name: "Standard Queue",
      description: "My queue description",
      passcode: "1234",
      organizationId: mockOrgId,
    }

    it("should create queue with valid data and permission", async () => {
      vi.mocked(db.organizationMembership.findUnique).mockResolvedValue({
        id: "membership-1",
        userId: mockUserId,
        organizationId: mockOrgId,
        role: "owner",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(queueRepo.getOrganizationQueues).mockResolvedValue([])
      vi.mocked(queueRepo.createQueue).mockResolvedValue({
        id: mockQueueId,
        name: "Standard Queue",
        description: "My queue description",
        passcode: "1234",
        organizationId: mockOrgId,
        theme: "{}",
        layout: "{}",
        isActive: true,
        createdAt: new Date(),
      })

      const result = await queueService.createQueue(validInput, mockUserId)
      expect(result.success).toBe(true)
    })

    it("should reject if admin tries to create a queue", async () => {
      vi.mocked(db.organizationMembership.findUnique).mockResolvedValue({
        id: "membership-1",
        userId: mockUserId,
        organizationId: mockOrgId,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await queueService.createQueue(validInput, mockUserId)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("permission")
      }
      expect(queueRepo.createQueue).not.toHaveBeenCalled()
    })

    it("should reject if name is duplicate", async () => {
      vi.mocked(db.organizationMembership.findUnique).mockResolvedValue({
        id: "membership-1",
        userId: mockUserId,
        organizationId: mockOrgId,
        role: "owner",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(queueRepo.getOrganizationQueues).mockResolvedValue([
        {
          id: "another-queue",
          name: "Standard Queue",
          description: "",
          passcode: null,
          organizationId: mockOrgId,
          theme: "{}",
          layout: "{}",
          isActive: true,
          createdAt: new Date(),
        },
      ])

      const result = await queueService.createQueue(validInput, mockUserId)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("already exists")
      }
    })
  })

  describe("deleteQueue", () => {
    it("should reject if queue has active tickets", async () => {
      vi.mocked(db.organizationMembership.findUnique).mockResolvedValue({
        id: "membership-1",
        userId: mockUserId,
        organizationId: mockOrgId,
        role: "owner",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(queueRepo.countActiveTickets).mockResolvedValue(5)
      vi.mocked(db.queue.findUnique).mockResolvedValue({
        id: mockQueueId,
        name: "Standard Queue",
        description: "",
        passcode: null,
        organizationId: mockOrgId,
        theme: "{}",
        layout: "{}",
        isActive: true,
        createdAt: new Date(),
      })

      const result = await queueService.deleteQueue(mockQueueId, mockUserId, mockOrgId)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("active tickets")
      }
    })
  })
})
