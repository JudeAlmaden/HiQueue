export type AnalyticsRangeKey = "today" | "7d" | "30d" | "90d" | "all" | "custom"

export interface HourlyVolumeItem {
  hour: number
  label: string
  count: number
}

export interface PeakHourInfo {
  label: string
  count: number
}

export interface QueueStat {
  id: string
  name: string
  active: boolean
  counterCount: number
  ticketCount: number
  completedCount: number
  avgWaitMinutes: number
}

export interface StaffThroughput {
  id: string
  name: string
  email: string
  assignedCounterCount: number
  handledTickets: number
  completedTickets: number
  avgHandleMinutes: number
}

export interface RecentTicket {
  id: string
  number: number
  code: string
  queue: string
  service: string
  status: string
  counter: string
  waitMinutes: number | null
  handleMinutes: number | null
  created: string
}

export interface WorkspaceAnalytics {
  organization: {
    id: string
    name: string
    slug: string
  }
  range: AnalyticsRangeKey
  filterMode: "preset" | "range" | "list"
  selectedDates?: string[]
  startDate?: string
  endDate?: string
  dateLabel?: string
  workingDaysOnly?: boolean
  selectedDaysOfWeek?: number[] // 0 = Sun, 1 = Mon, ..., 6 = Sat
  metrics: {
    ticketsInRange: number
    ticketsToday: number
    allTimeTickets: number
    activeTickets: number
    completedTickets: number
    completionRate: number
    avgWaitMinutes: number
    avgHandleMinutes: number
    activeQueues: number
    totalQueues: number
    teamMembers: number
    counters: number
  }
  statusCounts: Record<string, number>
  hourlyVolume: HourlyVolumeItem[]
  peakHour: PeakHourInfo | null
  queueStats: QueueStat[]
  staffThroughput: StaffThroughput[]
  recentTickets: RecentTicket[]
}
