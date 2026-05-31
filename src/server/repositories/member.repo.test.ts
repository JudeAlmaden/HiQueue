/**
 * Unit tests for member repository
 */

import { describe, it, expect } from "vitest"
import * as memberRepo from "./member.repo"

describe("member repository", () => {
  describe("exports", () => {
    it("should export createMember function", () => {
      expect(memberRepo.createMember).toBeDefined()
      expect(typeof memberRepo.createMember).toBe("function")
    })

    it("should export updateMemberUser function", () => {
      expect(memberRepo.updateMemberUser).toBeDefined()
      expect(typeof memberRepo.updateMemberUser).toBe("function")
    })

    it("should export updateMemberRole function", () => {
      expect(memberRepo.updateMemberRole).toBeDefined()
      expect(typeof memberRepo.updateMemberRole).toBe("function")
    })

    it("should export deleteMember function", () => {
      expect(memberRepo.deleteMember).toBeDefined()
      expect(typeof memberRepo.deleteMember).toBe("function")
    })

    it("should export getOrganizationMembers function", () => {
      expect(memberRepo.getOrganizationMembers).toBeDefined()
      expect(typeof memberRepo.getOrganizationMembers).toBe("function")
    })

    it("should export findMemberByEmail function", () => {
      expect(memberRepo.findMemberByEmail).toBeDefined()
      expect(typeof memberRepo.findMemberByEmail).toBe("function")
    })

    it("should export hasOtherMemberships function", () => {
      expect(memberRepo.hasOtherMemberships).toBeDefined()
      expect(typeof memberRepo.hasOtherMemberships).toBe("function")
    })

    it("should export wasCreatedByAnotherUser function", () => {
      expect(memberRepo.wasCreatedByAnotherUser).toBeDefined()
      expect(typeof memberRepo.wasCreatedByAnotherUser).toBe("function")
    })
  })
})
