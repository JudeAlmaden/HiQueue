import { describe, it, expect, beforeEach, vi } from "vitest"
import type { Prisma } from "@prisma/client"
import * as memberService from "./member.service"
import * as memberRepo from "@/server/repositories/member.repo"
import { db } from "@/server/lib/db"

// Mock the repository and db
vi.mock("@/server/repositories/member.repo")
vi.mock("@/server/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    staffUser: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    counter: {
      count: vi.fn(),
    },
  },
}))

describe("MemberService", () => {
  const mockUserId = "user-123"
  const mockOrgId = "org-123"
  const mockMemberId = "member-456"

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(memberRepo.getOrganizationMembers).mockResolvedValue([])
    vi.mocked(memberRepo.softDeleteMember).mockResolvedValue(undefined as unknown as Prisma.StaffUserGetPayload<object>)
    vi.mocked(db.counter.count).mockResolvedValue(0)
  })

  describe("createMember", () => {
    const validInput = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "staff" as const,
      organizationId: mockOrgId,
    }

    it("should create member with valid data when user is owner", async () => {
      // Mock user is owner
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockUserId,
        role: "owner",
        organizationId: mockOrgId,
      } as any)

      // Mock no existing member
      vi.mocked(memberRepo.findMemberByEmail).mockResolvedValue(null)
      vi.mocked(memberRepo.findUserWithMembershipByEmail).mockResolvedValue(null)

      // Mock successful creation
      vi.mocked(memberRepo.createMember).mockResolvedValue({
        id: mockMemberId,
        name: "John Doe",
        email: "john@example.com",
        password: "hashed",
        role: "staff",
        isActive: true,
        organizationId: mockOrgId,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await memberService.createMember(validInput, mockUserId)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe("john@example.com")
      }
    })

    it("should reject member creation when user is admin", async () => {
      // Mock user is admin
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockUserId,
        role: "admin",
        organizationId: mockOrgId,
      } as any)

      const result = await memberService.createMember(validInput, mockUserId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("owners")
      }
      expect(memberRepo.createMember).not.toHaveBeenCalled()
    })

    it("should reject if user is not a member of organization", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null)

      const result = await memberService.createMember(validInput, mockUserId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("not a member")
      }
    })

    it("should reject if user is staff", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockUserId,
        role: "staff",
        organizationId: mockOrgId,
      } as any)

      const result = await memberService.createMember(validInput, mockUserId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("permission")
      }
    })

    it("should reject if email already exists in organization", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockUserId,
        role: "owner",
        organizationId: mockOrgId,
      } as any)

      vi.mocked(memberRepo.findMemberByEmail).mockResolvedValue({
        id: "existing-user",
        name: "Existing User",
        email: "john@example.com",
        isActive: true,
        createdById: "owner",
        createdAt: new Date(),
        updatedAt: new Date(),
        memberships: [
          {
            id: "existing-user",
            role: "staff",
            organizationId: mockOrgId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]
      })

      const result = await memberService.createMember(validInput, mockUserId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("already exists")
      }
    })
  })

  describe("deleteMember", () => {
    const deleteInput = {
      id: mockMemberId,
      organizationId: mockOrgId,
    }

    it("should delete member when user is owner", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockUserId,
        role: "owner",
        organizationId: mockOrgId,
      } as any)

      vi.mocked(db.staffUser.findUnique).mockResolvedValue({
        id: mockMemberId,
        role: "staff",
        organizationId: mockOrgId,
        name: "Staff Member",
        email: "staff@example.com",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: "hashed",
        deletedAt: null,
      })

      vi.mocked(memberRepo.softDeleteMember).mockResolvedValue(undefined as unknown as Prisma.StaffUserGetPayload<object>)

      const result = await memberService.deleteMember(deleteInput, mockUserId)

      expect(result.success).toBe(true)
    })

    it("should reject if admin tries to remove a member", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockUserId,
        role: "admin",
        organizationId: mockOrgId,
      } as any)

      const result = await memberService.deleteMember(deleteInput, mockUserId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("owners")
      }
    })

    it("should reject if user is staff", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockUserId,
        role: "staff",
        organizationId: mockOrgId,
      } as any)

      const result = await memberService.deleteMember(deleteInput, mockUserId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("permission")
      }
    })
  })
})
