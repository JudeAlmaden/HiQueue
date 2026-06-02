import { notFound } from "next/navigation"
import { getOrgPortalBySlug } from "@/server/repositories/portal.repo"

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function OrgPortalRootLayout({ children, params }: Props) {
  const { slug } = await params
  const org = await getOrgPortalBySlug(slug)

  if (!org) notFound()

  const themeClass = org.theme.themeClass ?? ""
  const themeStyle = org.theme.cssVars ?? {}

  return (
    <div
      data-portal-org={org.slug}
      data-portal-org-id={org.id}
      className={`min-h-screen bg-background text-foreground transition-colors duration-200 ${themeClass}`}
      style={themeStyle}
    >
      {children}
    </div>
  )
}
