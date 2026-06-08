import { describe, it, expect } from "vitest"
import { createMemberSchema, updateMemberSchema, deleteMemberSchema } from "./member.validator"

describe("Member Validators", () => {
  describe("createMemberSchema", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password123",
      role: "staff" as const,
      organizationId: "org-123",
    }

    it("should accept valid member data", () => {
      const result = createMemberSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should trim and lowercase email", () => {
      const input = { ...validData, email: "  JOHN@EXAMPLE.COM  " }
      const result = createMemberSchema.parse(input)
      expect(result.email).toBe("john@example.com")
    })

    it("should reject name shorter than 2 characters", () => {
      const invalid = { ...validData, name: "J" }
      const result = createMemberSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it("should truncate name longer than 50 characters", () => {
      const invalid = { ...validData, name: "a".repeat(51) }
      const result = createMemberSchema.parse(invalid)
      expect(result.name.length).toBeLessThanOrEqual(50)
    })

    it("should reject invalid email format", () => {
      const invalid = { ...validData, email: "not-an-email" }
      const result = createMemberSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it("should reject password shorter than 8 characters", () => {
      const invalid = { ...validData, password: "short" }
      const result = createMemberSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it("should reject password longer than 100 characters", () => {
      const invalid = { ...validData, password: "a".repeat(101) }
      const result = createMemberSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it("should reject invalid role", () => {
      const invalid = { ...validData, role: "invalid" }
      const result = createMemberSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it("should reject owner role", () => {
      const input = { ...validData, role: "owner" as unknown as "staff" }
      const result = createMemberSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it("should accept admin role", () => {
      const input = { ...validData, role: "admin" as const }
      const result = createMemberSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it("should reject missing organizationId", () => {
      const invalid = { ...validData, organizationId: "" }
      const result = createMemberSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe("updateMemberSchema", () => {
    const validData = {
      id: "member-123",
      name: "John Doe",
      email: "john@example.com",
      role: "staff" as const,
    }

    it("should accept valid update data", () => {
      const result = updateMemberSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should accept partial update (name only)", () => {
      const input = { id: "member-123", name: "Jane Doe" }
      const result = updateMemberSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it("should accept partial update (email only)", () => {
      const input = { id: "member-123", email: "jane@example.com" }
      const result = updateMemberSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it("should accept partial update (role only)", () => {
      const input = { id: "member-123", role: "admin" as const }
      const result = updateMemberSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it("should reject missing id", () => {
      const invalid = { name: "John Doe" }
      const result = updateMemberSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it("should trim and lowercase email", () => {
      const input = { id: "member-123", email: "  JANE@EXAMPLE.COM  " }
      const result = updateMemberSchema.parse(input)
      expect(result.email).toBe("jane@example.com")
    })
  })

  describe("deleteMemberSchema", () => {
    it("should accept valid delete data", () => {
      const input = { id: "member-123", organizationId: "org-123" }
      const result = deleteMemberSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it("should reject missing id", () => {
      const invalid = { organizationId: "org-123" }
      const result = deleteMemberSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it("should reject missing organizationId", () => {
      const invalid = { id: "member-123" }
      const result = deleteMemberSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
})
