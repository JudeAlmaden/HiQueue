import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { db } from "@/server/lib/db"
import { isWorkspaceOwner } from "@/server/lib/account-access"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        orgSlug: { label: "Organization Slug", type: "text" },
        loginIntent: { label: "Login Intent", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = normalizeEmail(credentials.email as string)
        const password = credentials.password as string
        const loginIntent = credentials.loginIntent as string | undefined
        const orgSlug = (credentials.orgSlug as string | undefined)?.trim() || undefined

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user?.password) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(password, user.password)
        if (!passwordsMatch) {
          return null
        }

        if (loginIntent === "portal") {
          if (!orgSlug) return null

          const membership = await db.organizationMembership.findUnique({
            where: { userId: user.id },
            include: { organization: { select: { slug: true } } },
          })

          if (!membership || membership.organization.slug !== orgSlug) {
            return null
          }
        } else if (loginIntent === "dashboard") {
          if (!isWorkspaceOwner(user.createdById)) {
            return null
          }
        } else {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id

        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { createdById: true, isActive: true, deletedAt: true },
        })

        // Auto-logout if user is deleted or deactivated
        if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
          return null as any // Forces session to be destroyed
        }

        const owner = isWorkspaceOwner(dbUser?.createdById)
        token.isWorkspaceOwner = owner

        if (!owner) {
          const membership = await db.organizationMembership.findUnique({
            where: { userId: user.id },
            include: { organization: { select: { slug: true } } },
          })
          
          // Auto-logout if user no longer has organization membership
          if (!membership) {
            return null as any
          }
          
          token.orgSlug = membership.organization.slug
        } else {
          token.orgSlug = null
        }
      } else if (token.id) {
        // Validate existing token on every request
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true, deletedAt: true },
          })

          // Auto-logout if user was deleted or deactivated
          if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
            return null as any
          }
        } catch (error) {
          // Database error - force logout for safety
          console.error("Error validating user session:", error)
          return null as any
        }
      }
      return token
    },
    async session({ session, token }) {
      // If token is null (user deleted/deactivated), return null session
      if (!token || !token.id) {
        return null as any
      }

      if (session.user) {
        session.user.id = token.id as string
        session.user.isWorkspaceOwner = token.isWorkspaceOwner === true
        session.user.orgSlug = (token.orgSlug as string | null) ?? null
      }
      return session
    },
  },
})
