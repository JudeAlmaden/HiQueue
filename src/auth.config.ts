import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [], // Add providers like Google, GitHub, or Credentials here
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Always trust host - required for localhost in dev and Vercel deployments in prod
  trustHost: true,
} satisfies NextAuthConfig
