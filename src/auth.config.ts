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
  // Trust all Vercel deployment URLs to prevent CORS issues
  trustHost: true,
} satisfies NextAuthConfig
