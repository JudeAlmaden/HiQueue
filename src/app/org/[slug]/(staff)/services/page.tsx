import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { getOrgPortalBySlug, verifyOrgMembership } from "@/server/repositories/portal.repo"
import { db } from "@/server/lib/db"
import { ServiceActiveToggler } from "@/components/org/ServiceActiveToggler"
import { Layers, Tag } from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function StaffServicesPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) notFound()

  const org = await getOrgPortalBySlug(slug)
  if (!org) notFound()

  const membership = await verifyOrgMembership(userId, org.id)
  if (!membership) notFound()
  const role = membership.role
  const canManageServices = role === "owner" || role === "admin"

  if (!canManageServices) {
    redirect(`/org/${slug}/counter`)
  }

  // Fetch all queues with their services
  const queues = await db.queue.findMany({
    where: { organizationId: org.id },
    include: {
      services: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })

  const totalServices = queues.reduce((sum, q) => sum + q.services.length, 0)
  const openServices = queues.reduce(
    (sum, q) => sum + q.services.filter((s) => s.isActive).length,
    0
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          Staff Portal
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
          Services
        </h1>
        <p className="text-sm text-on-surface-variant max-w-xl">
          Open or close individual services across all queues. Closed services are hidden from
          customers on the kiosk.
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container">
          <Layers className="h-3.5 w-3.5" />
          {totalServices} {totalServices === 1 ? "Service" : "Services"} total
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {openServices} Open
        </span>
        {totalServices - openServices > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            {totalServices - openServices} Closed
          </span>
        )}
      </div>

      {/* Queues & Services */}
      {queues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center bg-card max-w-xl mx-auto space-y-3 shadow-sm">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
            <Tag className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-on-surface">No Queues Found</p>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
            No queues have been configured for this organization yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {queues.map((queue) => (
            <div
              key={queue.id}
              className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            >
              {/* Queue header */}
              <div className="px-5 py-3.5 bg-surface-low border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-on-surface">{queue.name}</h2>
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      queue.isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {queue.isActive ? "Queue Open" : "Queue Closed"}
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">
                  {queue.services.length} {queue.services.length === 1 ? "service" : "services"}
                </span>
              </div>

              {/* Services list */}
              {queue.services.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-xs text-on-surface-variant">
                    No services configured for this queue.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {queue.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {service.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Prefix: <span className="font-mono font-bold">{service.prefix}</span>
                          {service.avgDurationMinutes && (
                            <> · ~{service.avgDurationMinutes} min avg</>
                          )}
                        </p>
                      </div>
                      <ServiceActiveToggler
                        service={service}
                        organizationId={org.id}
                        orgSlug={slug}
                        queueId={queue.id}
                        currentUserRole={role}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
