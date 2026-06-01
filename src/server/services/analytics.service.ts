import { db } from "@/server/lib/db"

export const ANALYTICS_RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "all", label: "All time" },
] as const

export type AnalyticsRangeKey = (typeof ANALYTICS_RANGES)[number]["key"]

type TicketStatus = "waiting" | "serving" | "hold" | "done" | "skipped" | "no_show"

const STATUS_ORDER: TicketStatus[] = ["waiting", "serving", "hold", "done", "skipped", "no_show"]

export function parseAnalyticsRange(value: string | string[] | undefined): AnalyticsRangeKey {
  const rawValue = Array.isArray(value) ? value[0] : value
  return ANALYTICS_RANGES.some((range) => range.key === rawValue)
    ? (rawValue as AnalyticsRangeKey)
    : "7d"
}

function getRangeStart(range: AnalyticsRangeKey): Date | undefined {
  if (range === "all") return undefined

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  if (range === "today") return start

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
  start.setDate(start.getDate() - (days - 1))
  return start
}

function getTodayStart() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return start
}

function averageMinutes(values: number[]) {
  if (values.length === 0) return 0
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length)
}

function minutesBetween(start: Date, end: Date) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
}

function formatTicketTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function createStatusCounts() {
  return STATUS_ORDER.reduce<Record<string, number>>((counts, status) => {
    counts[status] = 0
    return counts
  }, {})
}

export async function getWorkspaceAnalytics(userId: string, range: AnalyticsRangeKey) {
  const organization = await db.organization.findFirst({
    where: {
      memberships: {
        some: { userId },
      },
    },
    include: {
      memberships: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      queues: {
        include: {
          counters: {
            include: {
              assignedStaff: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!organization) return null

  const rangeStart = getRangeStart(range)
  const todayStart = getTodayStart()

  const [rangeTickets, todayTicketCount, allTimeTicketCount] = await Promise.all([
    db.ticket.findMany({
      where: {
        organizationId: organization.id,
        ...(rangeStart ? { createdAt: { gte: rangeStart } } : {}),
      },
      include: {
        queue: {
          select: { id: true, name: true },
        },
        service: {
          select: { id: true, name: true },
        },
        counter: {
          select: {
            id: true,
            name: true,
            assignedStaff: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.ticket.count({
      where: {
        organizationId: organization.id,
        createdAt: { gte: todayStart },
      },
    }),
    db.ticket.count({
      where: { organizationId: organization.id },
    }),
  ])

  const statusCounts = createStatusCounts()
  const waitDurations = rangeTickets
    .filter((ticket) => ticket.calledAt)
    .map((ticket) => minutesBetween(ticket.createdAt, ticket.calledAt as Date))
  const handleDurations = rangeTickets
    .filter((ticket) => ticket.startedAt && ticket.completedAt)
    .map((ticket) => minutesBetween(ticket.startedAt as Date, ticket.completedAt as Date))
  const completedTickets = rangeTickets.filter((ticket) => ticket.status === "done")
  const terminalTickets = rangeTickets.filter((ticket) =>
    ["done", "skipped", "no_show"].includes(ticket.status)
  )

  for (const ticket of rangeTickets) {
    statusCounts[ticket.status] = (statusCounts[ticket.status] ?? 0) + 1
  }

  const staffStats = new Map<
    string,
    {
      id: string
      name: string
      email: string
      assignedCounters: Set<string>
      handledTickets: number
      completedTickets: number
      handlingMinutes: number[]
    }
  >()

  for (const membership of organization.memberships) {
    staffStats.set(membership.user.id, {
      id: membership.user.id,
      name: membership.user.name ?? membership.user.email ?? "Unnamed user",
      email: membership.user.email ?? "No email",
      assignedCounters: new Set<string>(),
      handledTickets: 0,
      completedTickets: 0,
      handlingMinutes: [],
    })
  }

  for (const queue of organization.queues) {
    for (const counter of queue.counters) {
      for (const staff of counter.assignedStaff) {
        staffStats.get(staff.id)?.assignedCounters.add(counter.id)
      }
    }
  }

  for (const ticket of rangeTickets) {
    if (!ticket.counter) continue

    for (const staff of ticket.counter.assignedStaff) {
      const stat = staffStats.get(staff.id)
      if (!stat) continue

      stat.handledTickets += 1
      if (ticket.status === "done") stat.completedTickets += 1
      if (ticket.startedAt && ticket.completedAt) {
        stat.handlingMinutes.push(minutesBetween(ticket.startedAt, ticket.completedAt))
      }
    }
  }

  const staffThroughput = Array.from(staffStats.values())
    .map((staff) => ({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      assignedCounterCount: staff.assignedCounters.size,
      handledTickets: staff.handledTickets,
      completedTickets: staff.completedTickets,
      avgHandleMinutes: averageMinutes(staff.handlingMinutes),
    }))
    .sort((a, b) => b.handledTickets - a.handledTickets || a.name.localeCompare(b.name))

  const queueStats = organization.queues.map((queue) => {
    const queueTickets = rangeTickets.filter((ticket) => ticket.queueId === queue.id)
    const queueCompleted = queueTickets.filter((ticket) => ticket.status === "done")
    const queueWaitDurations = queueTickets
      .filter((ticket) => ticket.calledAt)
      .map((ticket) => minutesBetween(ticket.createdAt, ticket.calledAt as Date))

    return {
      id: queue.id,
      name: queue.name,
      active: queue.isActive,
      counterCount: queue.counters.length,
      ticketCount: queueTickets.length,
      completedCount: queueCompleted.length,
      avgWaitMinutes: averageMinutes(queueWaitDurations),
    }
  })

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
    range,
    metrics: {
      ticketsInRange: rangeTickets.length,
      ticketsToday: todayTicketCount,
      allTimeTickets: allTimeTicketCount,
      activeTickets: rangeTickets.filter((ticket) => ["waiting", "serving", "hold"].includes(ticket.status)).length,
      completedTickets: completedTickets.length,
      completionRate:
        terminalTickets.length === 0
          ? 0
          : Math.round((completedTickets.length / terminalTickets.length) * 100),
      avgWaitMinutes: averageMinutes(waitDurations),
      avgHandleMinutes: averageMinutes(handleDurations),
      activeQueues: organization.queues.filter((queue) => queue.isActive).length,
      totalQueues: organization.queues.length,
      teamMembers: organization.memberships.length,
      counters: organization.queues.reduce((total, queue) => total + queue.counters.length, 0),
    },
    statusCounts,
    queueStats,
    staffThroughput,
    recentTickets: rangeTickets.slice(0, 8).map((ticket) => ({
      id: ticket.id,
      number: ticket.number,
      code: ticket.code,
      queue: ticket.queue.name,
      service: ticket.service.name,
      status: ticket.status,
      counter: ticket.counter?.name ?? "Unassigned",
      waitMinutes: ticket.calledAt ? minutesBetween(ticket.createdAt, ticket.calledAt) : null,
      handleMinutes:
        ticket.startedAt && ticket.completedAt
          ? minutesBetween(ticket.startedAt, ticket.completedAt)
          : null,
      created: formatTicketTime(ticket.createdAt),
    })),
  }
}
