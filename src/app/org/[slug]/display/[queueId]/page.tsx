import { notFound } from "next/navigation"
import { getQueueById } from "@/server/repositories/queue.repo"
import { getQueueTickets } from "@/server/repositories/ticket.repo"
import { getQueueCounters } from "@/server/repositories/counter.repo"
import { LiveDisplayClient } from "./LiveDisplayClient"
import { Metadata } from "next"
import { getOrgPortalBySlug } from "@/server/repositories/portal.repo"
import { mergePortalTheme, parsePreviewThemeParam } from "@/lib/portal-theme"

interface Props {
  params: Promise<{ slug: string; queueId: string }>
  searchParams: Promise<{ previewTheme?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { queueId } = await params
  const queue = await getQueueById(queueId)
  
  return {
    title: queue ? `${queue.name} - Live Display` : "Live Display",
    description: "Real-time queue display screen",
  }
}

export default async function LiveDisplayPage({ params, searchParams }: Props) {
  const { slug, queueId } = await params
  const { previewTheme } = await searchParams
  const orgPortal = await getOrgPortalBySlug(slug)
  if (!orgPortal) notFound()
  const preview = parsePreviewThemeParam(previewTheme)
  const effectiveTheme = preview ? mergePortalTheme(orgPortal.theme, preview) : orgPortal.theme

  const queue = await getQueueById(queueId)
  if (!queue) notFound()

  if (!queue.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
          <div className="h-16 w-16 mx-auto bg-red-500/20 text-red-400 flex items-center justify-center rounded-2xl">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Display Offline</h1>
          <p className="text-sm text-white/70 leading-relaxed">
            This live display is currently inactive. Please contact the administrator for assistance.
          </p>
        </div>
      </div>
    )
  }

  const tickets = await getQueueTickets(queueId)
  const counters = await getQueueCounters(queueId)

  return (
    <LiveDisplayClient
      queue={JSON.parse(JSON.stringify(queue))}
      initialTickets={JSON.parse(JSON.stringify(tickets))}
      initialCounters={JSON.parse(JSON.stringify(counters))}
      orgSlug={slug}
      hasPasscode={!!(queue.passcode && queue.passcode.trim().length > 0)}
      portalTheme={effectiveTheme}
    />
  )
}
