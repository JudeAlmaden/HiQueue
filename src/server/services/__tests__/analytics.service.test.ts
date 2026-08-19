import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  parseAnalyticsRange,
  parseSpecificDates,
  getWorkspaceAnalytics,
} from "../analytics.service"
import { db } from "@/server/lib/db"

vi.mock("@/server/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    staffUser: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
    },
    ticket: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe("Analytics Service — Edge Cases & Comprehensive Filtering", () => {
  const mockUserId = "user-owner-1"
  const mockOrgId = "org-clinic-1"

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── 1. PARSER UNIT TESTS ──────────────────────────────────────────────────
  describe("parseAnalyticsRange", () => {
    it("returns valid preset keys accurately", () => {
      expect(parseAnalyticsRange("today")).toBe("today")
      expect(parseAnalyticsRange("7d")).toBe("7d")
      expect(parseAnalyticsRange("30d")).toBe("30d")
      expect(parseAnalyticsRange("90d")).toBe("90d")
      expect(parseAnalyticsRange("all")).toBe("all")
      expect(parseAnalyticsRange("custom")).toBe("custom")
    })

    it("handles array inputs (extracts first element)", () => {
      expect(parseAnalyticsRange(["30d", "90d"])).toBe("30d")
      expect(parseAnalyticsRange(["invalid"])).toBe("7d")
    })

    it("falls back gracefully to '7d' for undefined or invalid inputs", () => {
      expect(parseAnalyticsRange(undefined)).toBe("7d")
      expect(parseAnalyticsRange("invalid_preset")).toBe("7d")
      expect(parseAnalyticsRange("")).toBe("7d")
    })
  })

  describe("parseSpecificDates", () => {
    it("parses a single specific date string", () => {
      const res = parseSpecificDates("2026-08-19")
      expect(res).not.toBeNull()
      expect(res?.selectedDates).toEqual(["2026-08-19"])
      expect(res?.dateRanges.length).toBe(1)
      expect(res?.label).toContain("2026")
    })

    it("parses multiple comma-separated specific dates", () => {
      const res = parseSpecificDates("2026-08-19, 2026-08-05, 2026-08-12")
      expect(res).not.toBeNull()
      expect(res?.selectedDates).toEqual(["2026-08-05", "2026-08-12", "2026-08-19"])
      expect(res?.dateRanges.length).toBe(3)
      expect(res?.label).toContain("3 specific days")
    })

    it("deduplicates duplicate date strings", () => {
      const res = parseSpecificDates("2026-08-19, 2026-08-19, 2026-08-19")
      expect(res).not.toBeNull()
      expect(res?.selectedDates).toEqual(["2026-08-19"])
      expect(res?.dateRanges.length).toBe(1)
    })

    it("falls back to from/to parameters if dates parameter is not provided", () => {
      const res = parseSpecificDates(undefined, "2026-08-01", "2026-08-10")
      expect(res).not.toBeNull()
      expect(res?.selectedDates).toEqual(["2026-08-01", "2026-08-10"])
    })

    it("returns null for completely invalid or malformed date inputs", () => {
      expect(parseSpecificDates("not-a-date")).toBeNull()
      expect(parseSpecificDates("2026/08/19")).toBeNull()
      expect(parseSpecificDates(undefined, "invalid", "bad")).toBeNull()
    })
  })

  // ─── 2. GET WORKSPACE ANALYTICS TESTS ─────────────────────────────────────
  describe("getWorkspaceAnalytics — Data Aggregation & Filtering", () => {
    const mockOrgData = {
      id: mockOrgId,
      name: "City Health Clinic",
      slug: "city-clinic",
      queues: [
        {
          id: "queue-1",
          name: "Main Reception",
          isActive: true,
          counters: [
            {
              id: "counter-1",
              name: "Desk 1",
              assignedStaff: [{ id: mockUserId, name: "Dr. Sarah", email: "sarah@clinic.com" }],
            },
          ],
        },
      ],
    }

    beforeEach(() => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockUserId,
        organizationId: mockOrgId,
      } as any)

      vi.mocked(db.organization.findUnique).mockResolvedValue(mockOrgData as any)
      vi.mocked(db.user.findMany).mockResolvedValue([{ id: mockUserId, name: "Dr. Sarah", email: "sarah@clinic.com" }] as any)
      vi.mocked(db.staffUser.findMany).mockResolvedValue([])
    })

    it("returns null when user does not belong to any organization", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null as any)
      vi.mocked(db.staffUser.findUnique).mockResolvedValue(null as any)

      const result = await getWorkspaceAnalytics("unknown-user", "7d")
      expect(result).toBeNull()
    })

    it("handles 0 ticket edge case cleanly without NaN errors", async () => {
      vi.mocked(db.ticket.findMany).mockResolvedValue([])
      vi.mocked(db.ticket.count).mockResolvedValue(0)

      const analytics = await getWorkspaceAnalytics(mockUserId, "7d")
      expect(analytics).not.toBeNull()
      expect(analytics?.metrics.ticketsInRange).toBe(0)
      expect(analytics?.metrics.completionRate).toBe(0)
      expect(analytics?.metrics.avgWaitMinutes).toBe(0)
      expect(analytics?.metrics.avgHandleMinutes).toBe(0)
      expect(analytics?.peakHour).toBeNull()
      expect(analytics?.hourlyVolume.length).toBe(24)
    })

    it("correctly filters for Working Days Only (excluding Saturday & Sunday)", async () => {
      // Wednesday Aug 19, 2026 (Day 3)
      const wednesdayTicket = {
        id: "t-wed",
        status: "done",
        createdAt: new Date(2026, 7, 19, 10, 0, 0),
        queueId: "queue-1",
        code: "A-001",
        queue: { id: "queue-1", name: "Main Reception" },
        service: { id: "s-1", name: "Consultation" },
        counter: null,
      }
      // Saturday Aug 22, 2026 (Day 6)
      const saturdayTicket = {
        id: "t-sat",
        status: "done",
        createdAt: new Date(2026, 7, 22, 14, 0, 0),
        queueId: "queue-1",
        code: "A-002",
        queue: { id: "queue-1", name: "Main Reception" },
        service: { id: "s-1", name: "Consultation" },
        counter: null,
      }
      // Sunday Aug 23, 2026 (Day 0)
      const sundayTicket = {
        id: "t-sun",
        status: "done",
        createdAt: new Date(2026, 7, 23, 9, 0, 0),
        queueId: "queue-1",
        code: "A-003",
        queue: { id: "queue-1", name: "Main Reception" },
        service: { id: "s-1", name: "Consultation" },
        counter: null,
      }

      vi.mocked(db.ticket.findMany).mockResolvedValue([wednesdayTicket, saturdayTicket, sundayTicket] as any)
      vi.mocked(db.ticket.count).mockResolvedValue(3)

      const analytics = await getWorkspaceAnalytics(
        mockUserId,
        "7d",
        undefined,
        undefined,
        undefined,
        true // workingDaysOnly = true
      )

      expect(analytics).not.toBeNull()
      expect(analytics?.metrics.ticketsInRange).toBe(1)
      expect(analytics?.recentTickets.length).toBe(1)
      expect(analytics?.recentTickets[0].code).toBe("A-001")
    })

    it("correctly filters for custom days of week (e.g. Tuesdays)", async () => {
      // Tuesday Aug 18, 2026 (Day 2)
      const tuesdayTicket = {
        id: "t-tue",
        status: "done",
        createdAt: new Date(2026, 7, 18, 10, 0, 0),
        queueId: "queue-1",
        code: "A-010",
        queue: { id: "queue-1", name: "Main Reception" },
        service: { id: "s-1", name: "Consultation" },
        counter: null,
      }
      // Wednesday Aug 19, 2026 (Day 3)
      const wednesdayTicket = {
        id: "t-wed",
        status: "done",
        createdAt: new Date(2026, 7, 19, 10, 0, 0),
        queueId: "queue-1",
        code: "A-011",
        queue: { id: "queue-1", name: "Main Reception" },
        service: { id: "s-1", name: "Consultation" },
        counter: null,
      }

      vi.mocked(db.ticket.findMany).mockResolvedValue([tuesdayTicket, wednesdayTicket] as any)
      vi.mocked(db.ticket.count).mockResolvedValue(2)

      // Request Tuesday (2) only
      const analytics = await getWorkspaceAnalytics(
        mockUserId,
        "7d",
        undefined,
        undefined,
        undefined,
        false,
        "2"
      )

      expect(analytics).not.toBeNull()
      expect(analytics?.metrics.ticketsInRange).toBe(1)
      expect(analytics?.recentTickets[0].code).toBe("A-010")
    })

    it("correctly calculates peak hour and hourly distribution", async () => {
      const date10a = new Date(2026, 7, 19, 10, 15, 0)
      const date10b = new Date(2026, 7, 19, 10, 45, 0)
      const date14 = new Date(2026, 7, 19, 14, 30, 0)

      const tickets = [
        {
          id: "t-10a",
          status: "done",
          createdAt: date10a,
          queueId: "queue-1",
          code: "A-1",
          queue: { id: "queue-1", name: "Main Reception" },
          service: { id: "s-1", name: "Consultation" },
          counter: null,
        },
        {
          id: "t-10b",
          status: "done",
          createdAt: date10b,
          queueId: "queue-1",
          code: "A-2",
          queue: { id: "queue-1", name: "Main Reception" },
          service: { id: "s-1", name: "Consultation" },
          counter: null,
        },
        {
          id: "t-2p",
          status: "done",
          createdAt: date14,
          queueId: "queue-1",
          code: "A-3",
          queue: { id: "queue-1", name: "Main Reception" },
          service: { id: "s-1", name: "Consultation" },
          counter: null,
        },
      ]

      vi.mocked(db.ticket.findMany).mockResolvedValue(tickets as any)
      vi.mocked(db.ticket.count).mockResolvedValue(3)

      const analytics = await getWorkspaceAnalytics(mockUserId, "today")

      expect(analytics).not.toBeNull()
      expect(analytics?.peakHour?.label).toBe("10 AM")
      expect(analytics?.peakHour?.count).toBe(2)

      const hour10 = analytics?.hourlyVolume.find((h) => h.hour === 10)
      expect(hour10?.count).toBe(2)
      const hour14 = analytics?.hourlyVolume.find((h) => h.hour === 14)
      expect(hour14?.count).toBe(1)
    })
  })
})
