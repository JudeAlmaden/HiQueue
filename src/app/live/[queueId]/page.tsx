import { getQueueById } from "@/server/repositories/queue.repo"
import { notFound } from "next/navigation"
import { LiveKioskClient } from "./LiveKioskClient"
import { mergePortalTheme, parsePortalBranding, parsePortalTheme, parsePreviewThemeParam } from "@/lib/portal-theme"

interface Props {
  params: Promise<{ queueId: string }>
  searchParams: Promise<{ previewTheme?: string }>
}

export default async function LiveKioskPage({ params, searchParams }: Props) {
  const { queueId } = await params
  const { previewTheme } = await searchParams
  const queue = await getQueueById(queueId)

  if (!queue) {
    notFound()
  }

  if (!queue.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-4 bg-card border border-border p-8 rounded-3xl shadow-lg">
          <div className="h-16 w-16 mx-auto bg-error/10 text-error flex items-center justify-center rounded-2xl">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-on-surface">Kiosk Offline</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            This live ticketing kiosk is currently inactive or offline. Please contact the administrator for assistance.
          </p>
        </div>
      </div>
    )
  }

  // Format the services and queue details for the client
  const services = queue.services.map((s) => ({
    id: s.id,
    name: s.name,
    prefix: s.prefix,
    avgDurationMinutes: s.avgDurationMinutes,
    isActive: s.isActive,
  }))
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
      <LiveKioskClient
        queueId={queue.id}
        queueName={queue.name}
        queueDescription={queue.description}
        hasPasscode={!!(queue.passcode && queue.passcode.trim().length > 0)}
        services={services}
        initialQueueOpen={queue.isActive}
        portalTheme={effectiveTheme}
        logoUrl={portalBranding.logoUrl ?? null}
      />
    </div>
  )
}
