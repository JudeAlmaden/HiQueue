import { db } from "@/server/lib/db"
import type { AnalyticsRangeKey, HourlyVolumeItem, PeakHourInfo, WorkspaceAnalytics } from "@/types/analytics"

export const ANALYTICS_RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "all", label: "All time" },
] as const

export type { AnalyticsRangeKey }

type TicketStatus = "waiting" | "serving" | "hold" | "done" | "skipped" | "no_show"

const STATUS_ORDER: TicketStatus[] = ["waiting", "serving", "hold", "done", "skipped", "no_show"]

export function parseAnalyticsRange(value: string | string[] | undefined): AnalyticsRangeKey {
  const rawValue = Array.isArray(value) ? value[0] : value
  if (rawValue === "custom") return "custom"
  return ANALYTICS_RANGES.some((range) => range.key === rawValue)
    ? (rawValue as AnalyticsRangeKey)
    : "7d"
}

export function parseSpecificDates(
  datesParam?: string | string[],
  fromParam?: string | string[],
  toParam?: string | string[]
): {
  dateRanges: { start: Date; end: Date; dateStr: string }[]
  selectedDates: string[]
  startDateStr?: string
  endDateStr?: string
  label: string
} | null {
  const rawDatesStr = Array.isArray(datesParam) ? datesParam.join(",") : datesParam
  const rawFrom = Array.isArray(fromParam) ? fromParam[0] : fromParam
  const rawTo = Array.isArray(toParam) ? toParam[0] : toParam

  const dateSet = new Set<string>()

  if (rawDatesStr) {
    for (const item of rawDatesStr.split(",")) {
      const trimmed = item.trim()
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        dateSet.add(trimmed)
      }
    }
  }

  if (dateSet.size === 0) {
    if (rawFrom && /^\d{4}-\d{2}-\d{2}$/.test(rawFrom)) dateSet.add(rawFrom)
    if (rawTo && /^\d{4}-\d{2}-\d{2}$/.test(rawTo)) dateSet.add(rawTo)
  }

  if (dateSet.size === 0) return null

  const sortedDates = Array.from(dateSet).sort()

  const dateRanges = sortedDates.map((dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number)
    const start = new Date(y, m - 1, d, 0, 0, 0, 0)
    const end = new Date(y, m - 1, d, 23, 59, 59, 999)
    return { start, end, dateStr }
  })

  const formatShort = (dStr: string) => {
    const [y, m, d] = dStr.split("-").map(Number)
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(y, m - 1, d))
  }

  let label = ""
  if (sortedDates.length === 1) {
    const [y, m, d] = sortedDates[0].split("-").map(Number)
    label = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
      new Date(y, m - 1, d)
    )
  } else if (sortedDates.length === 2) {
    label = `${formatShort(sortedDates[0])} & ${formatShort(sortedDates[1])}`
  } else {
    label = `${sortedDates.length} specific days (${formatShort(sortedDates[0])}, ${formatShort(
      sortedDates[1]
    )} +${sortedDates.length - 2} more)`
  }

  return {
    dateRanges,
    selectedDates: sortedDates,
    startDateStr: sortedDates[0],
    endDateStr: sortedDates[sortedDates.length - 1],
    label,
  }
}

function getRangeStart(range: AnalyticsRangeKey): Date | undefined {
  if (range === "all" || range === "custom") return undefined

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

function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM"
  if (hour === 12) return "12 PM"
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`
}

function createStatusCounts() {
  return STATUS_ORDER.reduce<Record<string, number>>((counts, status) => {
    counts[status] = 0
    return counts
  }, {})
}

export async function getWorkspaceAnalytics(
  userId: string,
  range: AnalyticsRangeKey,
  datesStr?: string,
  fromStr?: string,
  toStr?: string,
  workingDaysOnly = false,
  daysOfWeekStr?: string
): Promise<WorkspaceAnalytics | null> {
  let organizationId: string | null = null
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  })
  if (user?.organizationId) {
    organizationId = user.organizationId
  } else {
    const staff = await db.staffUser.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })
    if (staff) {
      organizationId = staff.organizationId
    }
  }

  if (!organizationId) return null

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    include: {
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

  if (!org) return null

  const owners = await db.user.findMany({
    where: { organizationId: org.id },
    select: { id: true, name: true, email: true },
  })

  const staffUsers = await db.staffUser.findMany({
    where: { organizationId: org.id, isActive: true },
    select: { id: true, name: true, email: true },
  })

  const memberships = [
    ...owners.map((o) => ({ user: o })),
    ...staffUsers.map((s) => ({ user: s })),
  ]

  const organization = {
    ...org,
    memberships,
  }

  // Parse filtering parameters
  let filterMode: "preset" | "range" | "list" = "preset"
  let dateFilter: Record<string, unknown> = {}
  let startDateStr: string | undefined
  let endDateStr: string | undefined
  let selectedDates: string[] = []
  let dateLabel = ""

  // Parse dates list
  if (datesStr) {
    const rawList = datesStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s))
    if (rawList.length > 0) {
      filterMode = "list"
      selectedDates = Array.from(new Set(rawList)).sort()
      const dateRanges = selectedDates.map((dStr) => {
        const [y, m, d] = dStr.split("-").map(Number)
        return {
          start: new Date(y, m - 1, d, 0, 0, 0, 0),
          end: new Date(y, m - 1, d, 23, 59, 59, 999),
          dateStr: dStr,
        }
      })
      dateFilter = {
        OR: dateRanges.map((dr) => ({
          createdAt: { gte: dr.start, lte: dr.end },
        })),
      }
      const formatShort = (dStr: string) => {
        const [y, m, d] = dStr.split("-").map(Number)
        return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
          new Date(y, m - 1, d)
        )
      }
      dateLabel =
        selectedDates.length === 1
          ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
              new Date(
                Number(selectedDates[0].split("-")[0]),
                Number(selectedDates[0].split("-")[1]) - 1,
                Number(selectedDates[0].split("-")[2])
              )
            )
          : `${selectedDates.length} specific days (${formatShort(selectedDates[0])}, ${formatShort(
              selectedDates[1]
            )}${selectedDates.length > 2 ? ` +${selectedDates.length - 2} more` : ""})`
    }
  }

  // Parse date range (from/to) if no list provided
  if (filterMode === "preset" && (fromStr || toStr)) {
    const rawFrom = fromStr && /^\d{4}-\d{2}-\d{2}$/.test(fromStr) ? fromStr : null
    const rawTo = toStr && /^\d{4}-\d{2}-\d{2}$/.test(toStr) ? toStr : null
    if (rawFrom || rawTo) {
      filterMode = "range"
      startDateStr = rawFrom ?? rawTo!
      endDateStr = rawTo ?? rawFrom!
      const [fY, fM, fD] = startDateStr.split("-").map(Number)
      const [tY, tM, tD] = endDateStr.split("-").map(Number)
      const start = new Date(fY, fM - 1, fD, 0, 0, 0, 0)
      const end = new Date(tY, tM - 1, tD, 23, 59, 59, 999)
      const actualStart = start <= end ? start : end
      const actualEnd = start <= end ? end : start
      startDateStr = start <= end ? startDateStr : endDateStr
      endDateStr = start <= end ? endDateStr : startDateStr
      dateFilter = {
        createdAt: { gte: actualStart, lte: actualEnd },
      }
      const formatShort = (d: Date) =>
        new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(d)
      dateLabel =
        startDateStr === endDateStr
          ? formatShort(actualStart)
          : `${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
              actualStart
            )} – ${formatShort(actualEnd)}`
    }
  }

  // Preset range default
  if (filterMode === "preset") {
    const rangeStart = getRangeStart(range)
    if (rangeStart) {
      dateFilter = { createdAt: { gte: rangeStart } }
    }
  }

  // Parse custom days of week (0..6)
  let selectedDaysOfWeek: number[] | undefined
  if (daysOfWeekStr) {
    const parsed = daysOfWeekStr
      .split(",")
      .map(Number)
      .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6)
    if (parsed.length > 0) {
      selectedDaysOfWeek = Array.from(new Set(parsed))
    }
  }

  const todayStart = getTodayStart()

  let [rangeTickets, todayTicketCount, allTimeTicketCount] = await Promise.all([
    db.ticket.findMany({
      where: {
        organizationId: organization.id,
        ...dateFilter,
      },
      include: {
        queue: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
        counter: {
          select: {
            id: true,
            name: true,
            assignedStaff: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.ticket.count({
      where: { organizationId: organization.id, createdAt: { gte: todayStart } },
    }),
    db.ticket.count({
      where: { organizationId: organization.id },
    }),
  ])

  // Filter for working days or custom days of week if specified
  if (workingDaysOnly) {
    rangeTickets = rangeTickets.filter((ticket) => {
      const day = new Date(ticket.createdAt).getDay()
      return day !== 0 && day !== 6
    })
  } else if (selectedDaysOfWeek && selectedDaysOfWeek.length > 0) {
    rangeTickets = rangeTickets.filter((ticket) => {
      const day = new Date(ticket.createdAt).getDay()
      return selectedDaysOfWeek?.includes(day)
    })
  }

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

  // Hourly volume calculation
  const hourlyBucketMap = new Map<number, number>()
  for (let i = 0; i < 24; i++) {
    hourlyBucketMap.set(i, 0)
  }

  for (const ticket of rangeTickets) {
    const hour = new Date(ticket.createdAt).getHours()
    hourlyBucketMap.set(hour, (hourlyBucketMap.get(hour) ?? 0) + 1)
  }

  const hourlyVolume: HourlyVolumeItem[] = Array.from(hourlyBucketMap.entries()).map(
    ([hour, count]) => ({
      hour,
      label: formatHourLabel(hour),
      count,
    })
  )

  let peakHour: PeakHourInfo | null = null
  let maxHourlyCount = 0
  for (const item of hourlyVolume) {
    if (item.count > maxHourlyCount) {
      maxHourlyCount = item.count
      peakHour = { label: item.label, count: item.count }
    }
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
    range: filterMode !== "preset" ? "custom" : range,
    filterMode,
    selectedDates,
    startDate: startDateStr,
    endDate: endDateStr,
    dateLabel,
    workingDaysOnly,
    selectedDaysOfWeek,
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
    hourlyVolume,
    peakHour,
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
