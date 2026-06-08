import NextAuth from "next-auth"
import type { Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { db } from "@/server/lib/db"

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
      async authorize(credentials: Record<string, unknown> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = normalizeEmail(credentials.email as string)
        const password = credentials.password as string
        const loginIntent = credentials.loginIntent as string | undefined
        const orgSlug = (credentials.orgSlug as string | undefined)?.trim() || undefined

        if (loginIntent === "portal") {
          if (!orgSlug) return null

          // First: check StaffUser table (staff/admin created by an owner)
          const staffUser = await db.staffUser.findFirst({
            where: {
              email,
              organization: { slug: orgSlug },
            },
            include: { organization: { select: { slug: true } } },
          })

          if (staffUser) {
            if (!staffUser.password || !staffUser.isActive || staffUser.deletedAt) {
              return null
            }
            const passwordsMatch = await bcrypt.compare(password, staffUser.password)
            if (!passwordsMatch) return null
            if (staffUser.organization.slug !== orgSlug) return null

            return {
              id: staffUser.id,
              email: staffUser.email,
              name: staffUser.name,
              userType: "staff" as const,
              orgSlug: staffUser.organization.slug,
              role: staffUser.role,
            }
          }

          // Fallback: check if a workspace owner is logging into their own portal
          const ownerUser = await db.user.findUnique({
            where: { email },
            include: { organization: { select: { slug: true } } },
          })

          if (ownerUser) {
            if (!ownerUser.password || !ownerUser.isActive || ownerUser.deletedAt) {
              return null
            }
            const passwordsMatch = await bcrypt.compare(password, ownerUser.password)
            if (!passwordsMatch) return null

            // Verify they own / are a member of this org via slug
            if (!ownerUser.organization || ownerUser.organization.slug !== orgSlug) {
              return null
            }

            return {
              id: ownerUser.id,
              email: ownerUser.email,
              name: ownerUser.name,
              userType: "owner" as const,
              orgSlug: ownerUser.organization.slug,
              role: ownerUser.role,
            }
          }

          return null
        }

        if (loginIntent === "dashboard") {
          const ownerUser = await db.user.findUnique({
            where: { email },
            include: { organization: { select: { slug: true } } },
          })

          if (!ownerUser) return null
          if (!ownerUser.password || !ownerUser.isActive || ownerUser.deletedAt) {
            return null
          }

          const passwordsMatch = await bcrypt.compare(password, ownerUser.password)
          if (!passwordsMatch) return null

          return {
            id: ownerUser.id,
            email: ownerUser.email,
            name: ownerUser.name,
            userType: "owner" as const,
            orgSlug: ownerUser.organization?.slug ?? null,
            role: ownerUser.role,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.id) {
        token.id = user.id
        const userType = user.userType || "owner"
        token.userType = userType
        token.orgSlug = user.orgSlug ?? null
        token.role = user.role ?? null
        token.isWorkspaceOwner = userType === "owner"

        if (userType === "owner") {
          const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: { isActive: true, deletedAt: true },
          })
          if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
            return null as unknown as never
          }
        } else {
          const dbStaff = await db.staffUser.findUnique({
            where: { id: user.id },
            select: { isActive: true, deletedAt: true },
          })
          if (!dbStaff || !dbStaff.isActive || dbStaff.deletedAt) {
            return null as unknown as never
          }
        }
      } else if (token.id) {
        // Validate existing token on every request
        try {
          if (token.userType === "owner") {
            const dbUser = await db.user.findUnique({
              where: { id: token.id as string },
              select: { isActive: true, deletedAt: true },
            })
            if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
              return null as unknown as never
            }
          } else {
            const dbStaff = await db.staffUser.findUnique({
              where: { id: token.id as string },
              select: { isActive: true, deletedAt: true },
            })
            if (!dbStaff || !dbStaff.isActive || dbStaff.deletedAt) {
              return null as unknown as never
            }
          }
        } catch (error) {
          console.error("Error validating user session:", error)
          return null as unknown as never
        }
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (!token || !token.id) {
        return null as unknown as never
      }

      if (session.user) {
        session.user.id = token.id as string
        session.user.isWorkspaceOwner = token.isWorkspaceOwner === true
        session.user.orgSlug = (token.orgSlug as string | null) ?? null
        session.user.userType = token.userType
        session.user.role = token.role
      }
      return session
    },
  },
})
