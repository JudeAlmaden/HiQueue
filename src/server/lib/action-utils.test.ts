/**
 * Unit tests for action utilities
 */

import { describe, it, expect } from "vitest"
import { ok, fail, type ActionResult } from "./action-utils"

describe("action utilities", () => {
  describe("ok", () => {
    it("should create a success result with data", () => {
      const data = { id: "123", name: "Test" }
      const result = ok(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(data)
      }
    })

    it("should work with void data", () => {
      const result = ok(undefined)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBeUndefined()
      }
    })

    it("should work with primitive types", () => {
      const stringResult = ok("test string")
      const numberResult = ok(42)
      const booleanResult = ok(true)

      expect(stringResult.success).toBe(true)
      expect(numberResult.success).toBe(true)
      expect(booleanResult.success).toBe(true)

      if (stringResult.success) expect(stringResult.data).toBe("test string")
      if (numberResult.success) expect(numberResult.data).toBe(42)
      if (booleanResult.success) expect(booleanResult.data).toBe(true)
    })
  })

  describe("fail", () => {
    it("should create a failure result with error message", () => {
      const errorMessage = "Something went wrong"
      const result = fail(errorMessage)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe(errorMessage)
      }
    })

    it("should work with empty error message", () => {
      const result = fail("")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe("")
      }
    })
  })

  describe("ActionResult type", () => {
    it("should allow type-safe success handling", () => {
      const result: ActionResult<{ id: string }> = ok({ id: "123" })

      if (result.success) {
        // TypeScript should know result.data exists here
        expect(result.data.id).toBe("123")
      }
    })

    it("should allow type-safe error handling", () => {
      const result: ActionResult<{ id: string }> = fail("Error occurred")

      if (!result.success) {
        // TypeScript should know result.error exists here
        expect(result.error).toBe("Error occurred")
      }
    })
  })
})
