/**
 * Unit tests for password utilities
 */

import { describe, it, expect } from "vitest"
import { hashPassword, verifyPassword } from "./password"

describe("password utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "testPassword123"
      const hashed = await hashPassword(password)

      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(0)
    })

    it("should generate different hashes for the same password", async () => {
      const password = "testPassword123"
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("verifyPassword", () => {
    it("should return true for matching password", async () => {
      const password = "testPassword123"
      const hashed = await hashPassword(password)

      const result = await verifyPassword(password, hashed)

      expect(result).toBe(true)
    })

    it("should return false for non-matching password", async () => {
      const password = "testPassword123"
      const wrongPassword = "wrongPassword456"
      const hashed = await hashPassword(password)

      const result = await verifyPassword(wrongPassword, hashed)

      expect(result).toBe(false)
    })

    it("should handle empty password", async () => {
      const password = ""
      const hashed = await hashPassword(password)

      const result = await verifyPassword(password, hashed)

      expect(result).toBe(true)
    })
  })
})
