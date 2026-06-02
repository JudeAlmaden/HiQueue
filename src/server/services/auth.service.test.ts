import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest"
import * as userRepo from "@/server/repositories/user.repo"
import { db } from "@/server/lib/db"
import { signIn } from "@/server/lib/auth"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {
    type = "CredentialsSignin"
  },
}))

vi.mock("@/server/repositories/user.repo")
vi.mock("@/server/lib/auth", () => ({
  signIn: vi.fn(),
}))
vi.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  hash: vi.fn(),
  compare: vi.fn(),
}))
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))
vi.mock("@/server/lib/account-access", () => ({
  isWorkspaceOwner: vi.fn(),
  getStaffPortalLoginPath: vi.fn(),
}))

vi.mock("@/server/lib/db", () => ({
  db: {
    organizationMembership: {
      findUnique: vi.fn(),
    },
  },
}))

import * as accountAccess from "@/server/lib/account-access"

describe("auth.service", () => {
  let authService: typeof import("./auth.service")

  beforeAll(async () => {
    authService = await import("./auth.service")
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("registerUser", () => {
    it("registers a new workspace owner and redirects to /login", async () => {
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
      vi.mocked(bcrypt.hash as any).mockResolvedValue("hashed")
      vi.mocked(userRepo.createUser).mockResolvedValue({ id: "u-1" } as any)

      await authService.registerUser({
        name: "Admin",
        email: "admin@example.com",
        password: "password123",
      })

      expect(userRepo.createUser).toHaveBeenCalledTimes(1)
      expect(redirect).toHaveBeenCalledWith("/login")
    })

    it("returns an error when the user already exists", async () => {
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ id: "u-1" } as any)

      const result = await authService.registerUser({
        name: "Admin",
        email: "admin@example.com",
        password: "password123",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("already exists")
      }
      expect(redirect).not.toHaveBeenCalled()
      expect(userRepo.createUser).not.toHaveBeenCalled()
    })
  })

  describe("loginUser", () => {
    const baseLogin = { email: "admin@example.com", password: "password123" }

    it("logs in a workspace owner (dashboard) and redirects to /dashboard", async () => {
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue({
        id: "u-1",
        email: "admin@example.com",
        password: "hashed",
        createdById: null,
      } as any)
      vi.mocked(bcrypt.compare as any).mockResolvedValue(true)
      vi.mocked(accountAccess.isWorkspaceOwner).mockReturnValue(true)
      vi.mocked(signIn).mockResolvedValue(undefined)

      await authService.loginUser(baseLogin, { orgSlug: null })

      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: baseLogin.email,
        password: baseLogin.password,
        orgSlug: "",
        loginIntent: "dashboard",
        redirect: false,
      })
      expect(redirect).toHaveBeenCalledWith("/dashboard")
    })

    it("rejects login on wrong password", async () => {
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue({
        id: "u-1",
        email: "admin@example.com",
        password: "hashed",
        createdById: null,
      } as any)
      vi.mocked(bcrypt.compare as any).mockResolvedValue(false)

      const result = await authService.loginUser(baseLogin, { orgSlug: null })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Invalid email or password")
      }
      expect(signIn).not.toHaveBeenCalled()
      expect(redirect).not.toHaveBeenCalled()
    })

    it("logs in a staff member for a workspace (portal) and redirects to /org/:slug/counter", async () => {
      const orgSlug = "sacli-140"

      vi.mocked(userRepo.findUserByEmail).mockResolvedValue({
        id: "u-2",
        email: "staff@example.com",
        password: "hashed",
        createdById: "admin-u",
      } as any)
      vi.mocked(bcrypt.compare as any).mockResolvedValue(true)
      vi.mocked(db.organizationMembership.findUnique).mockResolvedValue({
        id: "m-1",
        userId: "u-2",
        organizationId: "org-1",
        organization: { slug: orgSlug },
      } as any)
      vi.mocked(signIn).mockResolvedValue(undefined)

      await authService.loginUser(
        { email: "staff@example.com", password: "password123" },
        { orgSlug }
      )

      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "staff@example.com",
        password: "password123",
        orgSlug: orgSlug,
        loginIntent: "portal",
        redirect: false,
      })
      expect(redirect).toHaveBeenCalledWith(`/org/${orgSlug}/counter`)
    })

    it("rejects staff login when membership doesn't exist", async () => {
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue({
        id: "u-2",
        email: "staff@example.com",
        password: "hashed",
        createdById: "admin-u",
      } as any)
      vi.mocked(bcrypt.compare as any).mockResolvedValue(true)
      vi.mocked(db.organizationMembership.findUnique).mockResolvedValue(null)

      const result = await authService.loginUser(
        { email: "staff@example.com", password: "password123" },
        { orgSlug: "sacli-140" }
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("do not have access")
      }
      expect(signIn).not.toHaveBeenCalled()
      expect(redirect).not.toHaveBeenCalled()
    })
  })
})

