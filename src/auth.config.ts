import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [], // Add providers like Google, GitHub, or Credentials here
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  }
} satisfies NextAuthConfig
