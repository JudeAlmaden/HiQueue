import { auth } from "@/auth"

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  const user = req.auth?.user

  const isStaffAccount = user?.isWorkspaceOwner === false
  const staffOrgSlug = user?.orgSlug

  const isOnDashboard = pathname.startsWith("/dashboard")
  const isOnboarding = pathname.startsWith("/onboarding")
  const isOwnerAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")

  const orgSlug = pathname.match(/^\/org\/([^/]+)/)?.[1]
  const isOrgStaffRoute = Boolean(
    orgSlug &&
      (pathname.startsWith(`/org/${orgSlug}/counter`) ||
        pathname.startsWith(`/org/${orgSlug}/display`))
  )

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }

  if ((isOnDashboard || isOnboarding) && isLoggedIn && isStaffAccount) {
    const dest = staffOrgSlug
      ? `/org/${staffOrgSlug}/login`
      : "/login?error=staff"
    return Response.redirect(new URL(dest, req.nextUrl))
  }

  if (isOnboarding && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }

  if (isOrgStaffRoute && !isLoggedIn && orgSlug) {
    return Response.redirect(new URL(`/org/${orgSlug}/login`, req.nextUrl))
  }

  if (isOwnerAuthPage && isLoggedIn) {
    if (isStaffAccount) {
      const dest = staffOrgSlug
        ? `/org/${staffOrgSlug}/login`
        : "/login?error=staff"
      return Response.redirect(new URL(dest, req.nextUrl))
    }
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/).*)"],
}
