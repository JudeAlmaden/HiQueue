import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      /** True for accounts created via /register (workspace owners). */
      isWorkspaceOwner: boolean
      orgSlug?: string | null
      userType?: "owner" | "staff"
      role?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    userType?: "owner" | "staff"
    orgSlug?: string | null
    role?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isWorkspaceOwner?: boolean
    orgSlug?: string | null
    userType?: "owner" | "staff"
    role?: string | null
  }
}
