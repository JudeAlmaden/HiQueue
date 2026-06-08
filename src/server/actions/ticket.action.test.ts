import { describe, it, expect, beforeEach, vi } from "vitest"
import { verifyKioskPasscodeAction, createTicketAction } from "./ticket.action"
import * as queueRepo from "@/server/repositories/queue.repo"
import * as ticketRepo from "@/server/repositories/ticket.repo"

// ── Mocks ─────────────────────────────────────────────────────────────────

vi.mock("@/server/repositories/queue.repo")
vi.mock("@/server/repositories/ticket.repo")

// Mock getQueueById base shape — no passcode by default
const baseQueue = {
  id: "queue-1",
  name: "Test Queue",
  description: "A test queue",
  passcode: null as string | null,
  organizationId: "org-1",
  theme: "{}",
  layout: "{}",
  isActive: true,
  createdAt: new Date(),
  services: [
    {
      id: "service-1",
      name: "General",
      prefix: "G",
      avgDurationMinutes: 5,
      queueId: "queue-1",
      isActive: true,
      createdAt: new Date(),
    },
  ],
  counters: [],
  organization: { id: "org-1", name: "Test Org", slug: "test-org", portalTheme: "{}", portalBranding: "{}" },
}

// ── verifyKioskPasscodeAction ─────────────────────────────────────────────

describe("verifyKioskPasscodeAction", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns success:true when queue has no passcode", async () => {
    vi.mocked(queueRepo.getQueueById).mockResolvedValue({ ...baseQueue, passcode: null })

    const result = await verifyKioskPasscodeAction("queue-1", "anything")
    expect(result.success).toBe(true)
  })

  it("returns success:true when correct passcode is provided", async () => {
    vi.mocked(queueRepo.getQueueById).mockResolvedValue({ ...baseQueue, passcode: "secret123" })

    const result = await verifyKioskPasscodeAction("queue-1", "secret123")
    expect(result.success).toBe(true)
  })

  it("returns success:false when wrong passcode is provided", async () => {
    vi.mocked(queueRepo.getQueueById).mockResolvedValue({ ...baseQueue, passcode: "secret123" })

    const result = await verifyKioskPasscodeAction("queue-1", "wrongpassword")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("Incorrect passcode")
    }
  })

  it("returns success:false when empty passcode is provided for a locked queue", async () => {
    vi.mocked(queueRepo.getQueueById).mockResolvedValue({ ...baseQueue, passcode: "abc" })

    const result = await verifyKioskPasscodeAction("queue-1", "")
    expect(result.success).toBe(false)
  })

  it("returns fail when queue is not found", async () => {
    vi.mocked(queueRepo.getQueueById).mockResolvedValue(null)

    const result = await verifyKioskPasscodeAction("non-existent", "1234")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("Queue not found")
    }
  })
})

// ── createTicketAction ────────────────────────────────────────────────────

describe("createTicketAction", () => {
  const mockTicket = {
    id: "ticket-1",
    code: "G001",
    number: 1,
    status: "waiting",
    queueId: "queue-1",
    serviceId: "service-1",
    organizationId: "org-1",
    queueSessionId: "session-1",
    customer: "{}",
    priority: 0,
    createdAt: new Date(),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    counterId: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(queueRepo.getQueueById).mockResolvedValue({ ...baseQueue })
    vi.mocked(ticketRepo.createTicket).mockResolvedValue(mockTicket)
    vi.mocked(ticketRepo.getWaitingTicketsCount).mockResolvedValue(0)
  })

  it("creates a ticket successfully with valid input", async () => {
    const result = await createTicketAction({
      queueId: "queue-1",
      serviceId: "service-1",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.ticket.code).toBe("G001")
      expect(result.data.ticket.status).toBe("waiting")
      expect(result.data.serviceName).toBe("General")
    }
  })

  it("includes wait count and estimated wait time in result", async () => {
    vi.mocked(ticketRepo.getWaitingTicketsCount).mockResolvedValue(3)

    const result = await createTicketAction({
      queueId: "queue-1",
      serviceId: "service-1",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.waitCount).toBe(3)
      // avgDurationMinutes(5) * waitCount(3) = 15
      expect(result.data.estimatedWaitTime).toBe(15)
    }
  })

  it("returns customer name in ticket data when provided", async () => {
    const result = await createTicketAction({
      queueId: "queue-1",
      serviceId: "service-1",
      customerName: "Juan Dela Cruz",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.ticket.customerName).toBe("Juan Dela Cruz")
    }
  })

  it("returns fail when queueId is empty", async () => {
    const result = await createTicketAction({ queueId: "", serviceId: "service-1" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("Queue ID is required")
    }
  })

  it("returns fail when serviceId is empty", async () => {
    const result = await createTicketAction({ queueId: "queue-1", serviceId: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("Service ID is required")
    }
  })

  it("returns fail when queue is not found", async () => {
    vi.mocked(queueRepo.getQueueById).mockResolvedValue(null)

    const result = await createTicketAction({ queueId: "bad-id", serviceId: "service-1" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("Queue not found")
    }
  })

  it("handles customerName exceeding max length", async () => {
    const result = await createTicketAction({
      queueId: "queue-1",
      serviceId: "service-1",
      customerName: "A".repeat(101),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("100 characters")
    }
  })

  it("handles ticket creation failure gracefully", async () => {
    vi.mocked(ticketRepo.createTicket).mockRejectedValue(new Error("Service not found"))

    const result = await createTicketAction({ queueId: "queue-1", serviceId: "service-1" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("Service not found")
    }
  })
})
