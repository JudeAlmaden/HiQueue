import { getQueueById } from "@/server/repositories/queue.repo"
import { notFound } from "next/navigation"
import { TrackTicketClient } from "./TrackTicketClient"
import { mergePortalTheme, parsePortalBranding, parsePortalTheme, parsePreviewThemeParam } from "@/lib/portal-theme"

interface Props {
  params: Promise<{ queueId: string }>
  searchParams: Promise<{ previewTheme?: string }>
}

export default async function TrackTicketPage({ params, searchParams }: Props) {
  const { queueId } = await params
  const { previewTheme } = await searchParams
  const queue = await getQueueById(queueId)

  if (!queue) {
    notFound()
  }

  const portalTheme = parsePortalTheme(queue.organization.portalTheme ?? "{}")
  const portalBranding = parsePortalBranding(queue.organization.portalBranding ?? "{}")
  const preview = parsePreviewThemeParam(previewTheme)
  const effectiveTheme = preview ? mergePortalTheme(portalTheme, preview) : portalTheme
  const themeClass = effectiveTheme.themeClass ?? ""
  const modeClass = themeClass !== "theme-custom" && effectiveTheme.mode === "dark" ? "dark" : ""
  const shouldApplyCustomVars = themeClass === "theme-custom" && effectiveTheme.cssVars
  const themeStyle = shouldApplyCustomVars ? effectiveTheme.cssVars : {}

  return (
    <div
      data-portal-org={queue.organization.slug}
      data-portal-org-id={queue.organization.id}
      className={`min-h-screen bg-background text-foreground transition-colors duration-200 ${themeClass} ${modeClass}`}
      style={themeStyle}
    >
      <TrackTicketClient
        queueId={queue.id}
        queueName={queue.name}
        organizationName={queue.organization.name}
        portalTheme={effectiveTheme}
        logoUrl={portalBranding.logoUrl ?? null}
      />
    </div>
  )
}
