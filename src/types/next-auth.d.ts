import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      /** True for accounts created via /register (workspace owners). */
      isWorkspaceOwner: boolean
      /** Set for staff accounts — used to redirect away from /dashboard */
      orgSlug?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isWorkspaceOwner?: boolean
    orgSlug?: string | null
  }
}
