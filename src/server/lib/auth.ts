// Re-export auth utilities from the root auth module for convenience
// This keeps server-side code importing from @/server/lib/auth
// instead of reaching up to @/auth directly.

export { auth, signIn, signOut } from "@/auth"
