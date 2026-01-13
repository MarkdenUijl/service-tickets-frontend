import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTicketsStore } from '@/stores/ticketStore'
import { getTicketTypeColor } from '@/constants/ticketColors.js'
import { capitalizeWords } from '@/utils/capitalizeWords'

export const DASHBOARD_TITLES = {
  createdByDay: 'createdByDayText',
  openedByDay: 'openedByDayText',
  contractDivide: 'contractDivideText',
  ticketType: 'ticketTypeText',
  ticketPriority: 'ticketPriorityText',
  ticketStatus: 'ticketStatusText',
  ticketSource: 'ticketSourceText',
  avgResponseTime: 'avgResponseTimeText',
  avgResolutionTime: 'avgResolutionTimeText'
}

const PRIORITY_COLORS = {
  CRITICAL: 'var(--color-tile-priority-critical-back)',
  HIGH: 'var(--color-tile-priority-high-back)',
  MEDIUM: 'var(--color-tile-priority-medium-back)',
  LOW: 'var(--color-tile-priority-low-back)'
}

const STATUS_COLORS = {
  OPEN: 'var(--color-tile-mild-back)',
  PENDING: 'var(--color-tile-medium-back)',
  IN_PROGRESS: 'var(--color-tile-good-back)',
  ESCALATED: 'var(--color-tile-dire-back)'
}

const SOURCE_COLORS = {
  WEB: 'var(--color-tile-web-back)',
  PHONE: 'var(--color-tile-phone-back)',
  MAIL: 'var(--color-tile-mail-back)'
}

const getStatusColor = (status) => STATUS_COLORS[String(status || '').toUpperCase()] || 'var(--color-subtext)'


const OPEN_STATUS_ORDER = ['OPEN', 'PENDING', 'IN_PROGRESS', 'ESCALATED']
const OPEN_STATUS_SET = new Set(OPEN_STATUS_ORDER)

const SOURCE_ORDER = ['WEB', 'PHONE', 'MAIL']
const normalizeSource = (source) => String(source || '').toUpperCase()


const getPriorityColor = (priority) => PRIORITY_COLORS[String(priority || '').toUpperCase()] || 'var(--color-subtext)'

// --- DRY helpers for donut breakdowns
const isOpenTicket = (t) => t?.status !== 'CLOSED' && t?.status !== 'CANCELLED'
const normalizeStatus = (status) => String(status || '').toUpperCase()
const getContractBucketLabel = (ticket) => (ticket?.hadValidContractAtCreation === true ? 'WITH_CONTRACT' : 'WITHOUT_CONTRACT')
const getSourceColor = (source) => SOURCE_COLORS[String(source || '').toUpperCase()] || 'var(--color-subtext)'

const buildBreakdownSeries = (tickets, getKey) => {
  const countMap = new Map()

  for (const t of tickets) {
    const key = getKey(t) || 'Unknown'
    countMap.set(key, (countMap.get(key) || 0) + 1)
  }

  return Array
    .from(countMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

const formatLabel = dateStr => {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const toDayKey = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const toValidDate = (value) => {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const countByDayKey = (items, getDateValue) => {
  const map = new Map()

  for (const item of items) {
    const d = toValidDate(getDateValue(item))
    if (!d) continue

    const key = toDayKey(d)
    map.set(key, (map.get(key) || 0) + 1)
  }

  return map
}

const buildDayRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return []

  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  const days = []
  const current = new Date(start)

  while (current <= end) {
    days.push(toDayKey(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

const countByDayKeyByGroup = (items, getDateValue, getGroupKey) => {
  const groupToDayMap = new Map()

  for (const item of items) {
    const d = toValidDate(getDateValue(item))
    if (!d) continue

    const dayKey = toDayKey(d)
    const groupKey = getGroupKey(item) || 'Unknown'

    if (!groupToDayMap.has(groupKey)) {
      groupToDayMap.set(groupKey, new Map())
    }

    const dayMap = groupToDayMap.get(groupKey)
    dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1)
  }

  return groupToDayMap
}

const getEarliestValidDate = (items, getDateValue) => {
  let earliest = null

  for (const item of items) {
    const d = toValidDate(getDateValue(item))
    if (!d) continue

    if (!earliest || d < earliest) earliest = d
  }

  return earliest
}

// Pure helper: returns ms between ticket creation and the first engineer response, or null if unavailable/invalid
const getFirstEngineerResponseDeltaMs = (ticket) => {
  if (!ticket?.creationDate || !Array.isArray(ticket.responses) || !ticket.responses.length) return null

  const created = new Date(ticket.creationDate)
  if (Number.isNaN(created.getTime())) return null

  let earliestEngineerResponse = null

  for (const r of ticket.responses) {
    if (!r?.engineerResponse || !r?.creationDate) continue

    const responseDate = new Date(r.creationDate)
    if (Number.isNaN(responseDate.getTime())) continue

    if (!earliestEngineerResponse || responseDate < earliestEngineerResponse) {
      earliestEngineerResponse = responseDate
    }
  }

  if (!earliestEngineerResponse) return null
  if (earliestEngineerResponse < created) return null

  return earliestEngineerResponse - created
}

// Pure helper: returns ms between ticket creation and closing date (resolution time), or null if unavailable/invalid
const getResolutionDeltaMs = (ticket) => {
  if (!ticket?.creationDate || !ticket?.closingDate) return null
  if (ticket?.status !== 'CLOSED') return null

  const created = new Date(ticket.creationDate)
  const closed = new Date(ticket.closingDate)

  if (Number.isNaN(created.getTime()) || Number.isNaN(closed.getTime())) return null
  if (closed < created) return null

  return closed - created
}

const MS_PER_MINUTE = 1000 * 60
const MS_PER_HOUR = 1000 * 60 * 60

// Pure helper to compute core KPI metrics from a list of tickets
const computeKpiMetrics = (tickets) => {
  let openCount = 0
  let resolutionSumMs = 0
  let resolutionCount = 0
  let firstResponseSumMs = 0
  let firstResponseCount = 0
  let totalCount = 0
  let withContractCount = 0
  let totalSpentMs = 0

  for (const t of tickets) {
    totalCount++

    // Tickets with contract: project has a serviceContract object
    if (t?.hadValidContractAtCreation === true) {
      withContractCount++
    }

    // Total time spent across tickets (minutesSpent is stored in minutes)
    if (typeof t?.minutesSpent === 'number' && !Number.isNaN(t.minutesSpent) && t.minutesSpent > 0) {
      totalSpentMs += t.minutesSpent * MS_PER_MINUTE
    }

    // Open tickets: everything that is not closed or cancelled
    if (t.status !== 'CLOSED' && t.status !== 'CANCELLED') {
      openCount++
    }

    // Average resolution time: only for closed tickets with valid dates
    if (t.status === 'CLOSED' && t.creationDate && t.closingDate) {
      const created = new Date(t.creationDate)
      const closed = new Date(t.closingDate)

      if (!Number.isNaN(created.getTime()) && !Number.isNaN(closed.getTime()) && closed >= created) {
        resolutionSumMs += (closed - created)
        resolutionCount++
      }
    }

    // Average first response time: first engineer response vs ticket creation
    if (t.creationDate && Array.isArray(t.responses) && t.responses.length) {
      let earliestEngineerResponse = null

      for (const r of t.responses) {
        if (!r.engineerResponse || !r.creationDate) continue

        const responseDate = new Date(r.creationDate)
        if (Number.isNaN(responseDate.getTime())) continue

        if (!earliestEngineerResponse || responseDate < earliestEngineerResponse) {
          earliestEngineerResponse = responseDate
        }
      }

      if (earliestEngineerResponse) {
        const created = new Date(t.creationDate)

        if (!Number.isNaN(created.getTime()) && earliestEngineerResponse >= created) {
          firstResponseSumMs += (earliestEngineerResponse - created)
          firstResponseCount++
        }
      }
    }
  }

  const avgResolutionMs = resolutionCount ? resolutionSumMs / resolutionCount : null
  const avgFirstResponseMs = firstResponseCount ? firstResponseSumMs / firstResponseCount : null
  const contractTicketPercent = totalCount ? (withContractCount / totalCount) * 100 : null
  
  return {
    openCount,
    avgResolutionMs,    
    avgFirstResponseMs,
    contractTicketPercent,
    totalSpentMs
  }
}

// Format a duration in ms as a readable label for the KPI card
const formatDurationForCard = (ms, t) => {
  if (ms == null) return null

  const totalMinutes = Math.floor(ms / MS_PER_MINUTE)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) {
    return `${minutes} ${t('base.minutesShortText')}`
  }

  if (minutes === 0) {
    return `${hours} ${t('base.hoursShortText')}`
  }

  return `${hours} ${t('base.hoursShortText')} ${minutes} ${t('base.minutesShortText')}`
}

const formatPercentForCard = (value, decimals = 0) => {
  if (value == null) return null
  if (Number.isNaN(value)) return null

  const factor = 10 ** decimals
  const rounded = Math.round(value * factor) / factor
  return `${rounded}%`
}

  /**
   * ===============================
   * DATA LAYER
   * ===============================
   */
export function useDashboardData() {
  const store = useTicketsStore()
  const { t } = useI18n()

  /**
   * ===============================
   * KPI CARD DATA
   * ===============================
   */
  const cards = computed(() => {
    const tickets = store.filteredTickets

    const { openCount, avgResolutionMs, avgFirstResponseMs, contractTicketPercent, totalSpentMs } = computeKpiMetrics(tickets)

    const avgResolutionLabel = formatDurationForCard(avgResolutionMs, t)
    const avgFirstResponseLabel = formatDurationForCard(avgFirstResponseMs, t)
    const contractPercentLabel = formatPercentForCard(contractTicketPercent)
    const totalSpentLabel = formatDurationForCard(totalSpentMs, t)

    return [
      {
        cardTitle: t('dash.kpiOpenTicketsText'),
        cardInfo: openCount
      },
      {
        cardTitle: t('dash.kpiAvgResolutionTimeText'),
        cardInfo: avgResolutionLabel ?? t('dash.kpiNoDataText')
      },
      {
        cardTitle: t('dash.kpiAvgResponseTimeText'),
        cardInfo: avgFirstResponseLabel ?? t('dash.kpiNoDataText')
      },
      {
        cardTitle: t('dash.kpiContractTicketPercentageText'),
        cardInfo: contractPercentLabel ?? t('dash.kpiNoDataText')
      },
      {
        cardTitle: t('dash.kpiTotalTimeSpentText'),
        cardInfo: totalSpentLabel ?? t('dash.kpiNoDataText')
      }
    ]
  })

  /**
   * ===============================
   * CHART SERIES BUILDERS
   * ===============================
   */

  // --- Bar chart: tickets created vs closed per day
  const createdByDaySeries = computed(() => {
    const tickets = store.filteredTickets
    if (!tickets.length) return { series: [], categories: [] }

    const createdByDay = countByDayKey(tickets, t => t.creationDate)
    const closedByDay  = countByDayKey(tickets, t => t.closingDate)

    const earliestCreated = getEarliestValidDate(tickets, t => t.creationDate)
    if (!earliestCreated) return { series: [], categories: [] }

    const endDate = store.dateRange?.end
      ? new Date(store.dateRange.end)
      : new Date()

    const allDays = buildDayRange(earliestCreated, endDate)

    const createdData = allDays.map(day => [
      new Date(day).getTime(),
      createdByDay.get(day) || 0
    ])

    const closedData = allDays.map(day => [
      new Date(day).getTime(),
      closedByDay.get(day) || 0
    ])

    return {
      series: [
        { name: t('base.createdText'), data: createdData },
        { name: t('base.closedText'), data: closedData }
      ],
      categories: allDays.map(formatLabel)
    }
  })

    // --- Line chart: tickets opened per day (tickets created per day)
  const openedByDaySeries = computed(() => {
    const tickets = store.filteredTickets
    if (!tickets.length) return { series: [], categories: [] }

    const openedByDay = countByDayKey(tickets, t => t.creationDate)

    const earliestCreated = getEarliestValidDate(tickets, t => t.creationDate)
    if (!earliestCreated) return { series: [], categories: [] }

    const endDate = store.dateRange?.end ? new Date(store.dateRange.end) : new Date()
    const allDays = buildDayRange(earliestCreated, endDate)

    const openedData = allDays.map(day => [new Date(day).getTime(), openedByDay.get(day) || 0])

    return {
      series: [
        { name: t('base.createdText'), data: openedData }
      ],
      categories: allDays.map(formatLabel)
    }
  })

  // --- Donut chart: tickets with contract vs without contract
  const contractDivideSeries = computed(() => {
    return buildBreakdownSeries(store.filteredTickets, getContractBucketLabel)
  })

  // --- Donut chart: ticket type breakdown
  const ticketTypeSeries = computed(() => {
    return buildBreakdownSeries(store.filteredTickets, t => t.type)
  })

    // --- Donut chart: open ticket priority breakdown (exclude CLOSED/CANCELLED)
  const ticketPrioritySeries = computed(() => {
    const openTickets = store.filteredTickets.filter(isOpenTicket)
    return buildBreakdownSeries(openTickets, t => t.priority)
  })

    // --- Donut chart: open ticket status breakdown (only OPEN/PENDING/IN_PROGRESS/ESCALATED)
  const ticketStatusSeries = computed(() => {
    const openTickets = store.filteredTickets
      .filter(isOpenTicket)
      .filter(t => OPEN_STATUS_SET.has(normalizeStatus(t.status)))

    // Build counts like the other donut series
    const series = buildBreakdownSeries(openTickets, t => normalizeStatus(t.status) || 'Unknown')

    // Ensure a consistent, meaningful order instead of alphabetical
    series.sort((a, b) => OPEN_STATUS_ORDER.indexOf(a.label) - OPEN_STATUS_ORDER.indexOf(b.label))

    return series
  })

  // --- Area chart: tickets by source per day
  const ticketsBySourcePerDaySeries = computed(() => {
    const tickets = store.filteredTickets
    if (!tickets.length) return { series: [], categories: [] }

    const earliestCreated = getEarliestValidDate(tickets, t => t.creationDate)
    if (!earliestCreated) return { series: [], categories: [] }

    const endDate = store.dateRange?.end
      ? new Date(store.dateRange.end)
      : new Date()

    const allDays = buildDayRange(earliestCreated, endDate)

    // Map: source -> (day -> count)
    const sourceToDayCounts = countByDayKeyByGroup(
      tickets,
      t => t.creationDate,
      t => normalizeSource(t?.source)
    )

    // Deterministic ordering & whitelist for known channels
    const sources = SOURCE_ORDER.filter(src => sourceToDayCounts.has(src))

    const series = sources.map(source => {
      const dayCounts = sourceToDayCounts.get(source)

      const data = allDays.map(day => [
        new Date(day).getTime(),
        (dayCounts?.get(day) || 0)
      ])

      return {
        name: t(`ticket.source${capitalizeWords(String(source).toLowerCase())}Text`) || capitalizeWords(String(source).toLowerCase()),
        data
      }
    })

    return {
      series,
      categories: allDays.map(formatLabel)
    }
  })

  // --- Area chart: avg first response time (contract vs non-contract) per day
  const avgFirstResponseTimeSeries = computed(() => {
    const tickets = store.filteredTickets
    if (!tickets.length) return { series: [], categories: [] }

    const earliestCreated = getEarliestValidDate(tickets, t => t.creationDate)
    if (!earliestCreated) return { series: [], categories: [] }

    const endDate = store.dateRange?.end
      ? new Date(store.dateRange.end)
      : new Date()

    const allDays = buildDayRange(earliestCreated, endDate)

    // Sum + count per day for each group
    const contractSumMsByDay = new Map()
    const contractCountByDay = new Map()
    const nonContractSumMsByDay = new Map()
    const nonContractCountByDay = new Map()

    for (const t of tickets) {
      const day = toDayKey(t.creationDate)
      if (!day) continue

      const deltaMs = getFirstEngineerResponseDeltaMs(t)
      if (deltaMs == null) continue

      const isContract = t?.hadValidContractAtCreation === true

      if (isContract) {
        contractSumMsByDay.set(day, (contractSumMsByDay.get(day) || 0) + deltaMs)
        contractCountByDay.set(day, (contractCountByDay.get(day) || 0) + 1)
      } else {
        nonContractSumMsByDay.set(day, (nonContractSumMsByDay.get(day) || 0) + deltaMs)
        nonContractCountByDay.set(day, (nonContractCountByDay.get(day) || 0) + 1)
      }
    }

    // Return minutes (not ms) so the chart is readable
    const contractAvgMinutes = allDays.map(day => {
      const count = contractCountByDay.get(day) || 0
      if (!count) return [new Date(day).getTime(), 0]

      const avgMs = contractSumMsByDay.get(day) / count
      return [new Date(day).getTime(), Math.round(avgMs / MS_PER_MINUTE)]
    })

    const nonContractAvgMinutes = allDays.map(day => {
      const count = nonContractCountByDay.get(day) || 0
      if (!count) return [new Date(day).getTime(), 0]

      const avgMs = nonContractSumMsByDay.get(day) / count
      return [new Date(day).getTime(), Math.round(avgMs / MS_PER_MINUTE)]
    })

    return {
      series: [
        { name: t('dash.contractTicketsText') || 'Contract', data: contractAvgMinutes },
        { name: t('dash.nonContractTicketsText') || 'Non-contract', data: nonContractAvgMinutes }
      ],
      categories: allDays.map(formatLabel)
    }
  })

  // --- Line chart: avg resolution time (contract vs non-contract) per day (grouped by closing day)
  const avgResolutionTimeSeries = computed(() => {
    const tickets = store.filteredTickets
    if (!tickets.length) return { series: [], categories: [] }

    // Only closed tickets can contribute to resolution time
    const closedTickets = tickets.filter(t => t?.status === 'CLOSED' && t?.closingDate)
    if (!closedTickets.length) return { series: [], categories: [] }

    // Date range: first closing day → endDate (date filter end, or today)
    const earliestClosed = getEarliestValidDate(closedTickets, t => t.closingDate)
    if (!earliestClosed) return { series: [], categories: [] }

    const endDate = store.dateRange?.end
      ? new Date(store.dateRange.end)
      : new Date()

    const allDays = buildDayRange(earliestClosed, endDate)

    // Sum + count per day for each group
    const contractSumMsByDay = new Map()
    const contractCountByDay = new Map()
    const nonContractSumMsByDay = new Map()
    const nonContractCountByDay = new Map()

    for (const t of closedTickets) {
      const day = toDayKey(t.closingDate)
      if (!day) continue

      const deltaMs = getResolutionDeltaMs(t)
      if (deltaMs == null) continue

      const isContract = t?.hadValidContractAtCreation === true

      if (isContract) {
        contractSumMsByDay.set(day, (contractSumMsByDay.get(day) || 0) + deltaMs)
        contractCountByDay.set(day, (contractCountByDay.get(day) || 0) + 1)
      } else {
        nonContractSumMsByDay.set(day, (nonContractSumMsByDay.get(day) || 0) + deltaMs)
        nonContractCountByDay.set(day, (nonContractCountByDay.get(day) || 0) + 1)
      }
    }

    // Return minutes (not ms) for readability; use null to avoid misleading zeros when no data that day
    const contractAvgMinutes = allDays.map(day => {
      const count = contractCountByDay.get(day) || 0
      if (!count) return [new Date(day).getTime(), 0]

      const avgMs = contractSumMsByDay.get(day) / count
      return [new Date(day).getTime(), Math.round(avgMs / MS_PER_MINUTE)]
    })

    const nonContractAvgMinutes = allDays.map(day => {
      const count = nonContractCountByDay.get(day) || 0
      if (!count) return [new Date(day).getTime(), 0]

      const avgMs = nonContractSumMsByDay.get(day) / count
      return [new Date(day).getTime(), Math.round(avgMs / MS_PER_MINUTE)]
    })

    return {
      series: [
        { name: t('dash.contractTicketsText') || 'Contract', data: contractAvgMinutes },
        { name: t('dash.nonContractTicketsText') || 'Non-contract', data: nonContractAvgMinutes }
      ],
      categories: allDays.map(formatLabel)
    }
  })

  /**
   * ===============================
   * CHART OPTIONS BUILDERS
   * ===============================
   */
  const createdByDayOptions = computed(() => ({
    chart: { id: 'tickets-per-day' },
    xaxis: {
      type: 'datetime',
      tickAmount: 10,
      labels: {
        format: 'dd MMM',
        rotate: -45
      }
    },
    plotOptions: { bar: { borderRadius: 2, borderRadiusApplication: 'end' } },
    colors: [
      'var(--color-secondary)',
      'var(--color-highlight)'
    ],
    stroke: { width: 2 },
    legend: { position: 'top', horizontalAlign: 'left', itemMargin: { horizontal: 40 } },
    grid: { borderColor: 'var(--color-subtext)' }
  }))

  const openedByDayOptions = computed(() => ({
    chart: {
      id: 'tickets-opened-per-day',
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      decimalsInFloat: 0
    },
    xaxis: {
      type: 'datetime',
      tickAmount: 10,
      labels: {
        format: 'dd MMM',
        rotate: -45
      },
      tooltip: {
        enabled: false
      }
    },
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    markers: {
      size: 0,
      hover: { size: 5 }
    },
    dataLabels: { enabled: false },
    colors: ['var(--color-highlight)'],
    grid: { borderColor: 'var(--color-subtext)' },
    legend: { show: false }
  }))

  const contractDivideOptions = computed(() => {
    const rawLabels = contractDivideSeries.value.map(item => String(item.label || 'Unknown'))

    const localizedLabels = rawLabels.map(label => {
      if (label === 'WITH_CONTRACT') return t('dash.contractTicketsText') || 'Contract'
      if (label === 'WITHOUT_CONTRACT') return t('dash.nonContractTicketsText') || 'Non-contract'
      return capitalizeWords(label.replaceAll('_', ' '))
    })

    return {
      chart: { fontFamily: 'Noto Sans JP', offsetY: 0, id: 'contract-divide' },
      colors: ['var(--color-highlight)', 'var(--color-third-complementary)'],
      labels: localizedLabels,
      stroke: { width: 4, colors: ['var(--color-menu-background)'] },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        itemMargin: { horizontal: 8, vertical: 4 },
        formatter(seriesName) {
          const s = String(seriesName ?? '')
          return s.length > 32 ? `${s.slice(0, 29)}…` : s
        }
      },
      tooltip: { fillSeriesColor: false },
      plotOptions: {
        pie: {
          // FULL donut
          startAngle: 0,
          endAngle: 360,
          expandOnClick: false,
          offsetY: 0,
          customScale: 1.06,
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: { show: true },
              value: { show: true, fontSize: 48, fontFamily: 'Ubuntu', color: 'var(--color-text)', offsetY: 24 },
              total: {
                show: true,
                showAlways: true,
                fontSize: 14,
                label: t('dash.totalTicketsText'),
                fontFamily: 'Noto Sans JP',
                color: 'var(--color-text)',
                fontWeight: 700
              }
            }
          }
        }
      }
    }
  })

  const ticketTypeOptions = computed(() => {
    const rawLabels = ticketTypeSeries.value.map(item => capitalizeWords(item.label))
    const localizedLabels = rawLabels.map(label =>
      t(`ticket.type${label}Text`) || capitalizeWords(label)
    )
    const colors = rawLabels.map(label => getTicketTypeColor(label))

    return {
      chart: { fontFamily: 'Noto Sans JP', offsetY: 0, id: 'ticket-type-breakdown' },
      colors,
      labels: localizedLabels,
      stroke: { width: 4, colors: ['var(--color-menu-background)'] },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        itemMargin: { horizontal: 8, vertical: 4 },
        formatter(seriesName) {
          const s = String(seriesName ?? '')
          return s.length > 32 ? `${s.slice(0, 29)}…` : s
        }
      },
      tooltip: { fillSeriesColor: false },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          expandOnClick: false,
          offsetY: 0,
          customScale: 1.06,
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: { show: true },
              value: { show: true, fontSize: 48, fontFamily: 'Ubuntu', color: 'var(--color-text)', offsetY: 24 },
              total: { show: true, showAlways: true, fontSize: 14, label: t('dash.totalTicketsText'), fontFamily: 'Noto Sans JP', color: 'var(--color-text)', fontWeight: 700 }
            }
          }
        }
      }
    }
  })

  const ticketPriorityOptions = computed(() => {
    const rawLabels = ticketPrioritySeries.value.map(item => String(item.label || 'Unknown'))

    const localizedLabels = rawLabels.map(label => {
      const normalized = label.toLowerCase()
      const key = normalized.charAt(0).toUpperCase() + normalized.slice(1)

      return t(`ticket.priority${key}Text`) || capitalizeWords(label)
    })

    const colors = rawLabels.map(label => getPriorityColor(label))

    return {
      chart: { fontFamily: 'Noto Sans JP', offsetY: 0, id: 'ticket-priority-breakdown' },
      colors,
      labels: localizedLabels,
      stroke: { width: 4, colors: ['var(--color-menu-background)'] },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        itemMargin: { horizontal: 8, vertical: 4 },
        formatter(seriesName) {
          const s = String(seriesName ?? '')
          return s.length > 32 ? `${s.slice(0, 29)}…` : s
        }
      },
      tooltip: { fillSeriesColor: false },
      noData: { text: t('dash.noOpenTicketsText') },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          expandOnClick: false,
          offsetY: 0,
          customScale: 1.06,
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: { show: true },
              value: { show: true, fontSize: 48, fontFamily: 'Ubuntu', color: 'var(--color-text)', offsetY: 24 },
              total: { show: true, showAlways: true, fontSize: 14, label: t('dash.kpiOpenTicketsText'), fontFamily: 'Noto Sans JP', color: 'var(--color-text)', fontWeight: 700 }
            }
          }
        }
      }
    }
  })

  const ticketStatusOptions = computed(() => {
    const rawLabels = ticketStatusSeries.value.map(item => String(item.label || 'Unknown'))
    
    const localizedLabels = rawLabels.map(label => {
      return t(`ticket.status${capitalizeWords(label)}Text`)
    })

    const colors = rawLabels.map(label => getStatusColor(label))

    return {
      chart: { fontFamily: 'Noto Sans JP', offsetY: 0, id: 'ticket-status-breakdown' },
      colors,
      labels: localizedLabels,
      stroke: { width: 4, colors: ['var(--color-menu-background)'] },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        itemMargin: { horizontal: 8, vertical: 4 },
        formatter(seriesName) {
          const s = String(seriesName ?? '')
          return s.length > 32 ? `${s.slice(0, 29)}…` : s
        }
      },
      tooltip: { fillSeriesColor: false },
      noData: { text: t('dash.noOpenTicketsText') },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          expandOnClick: false,
          offsetY: 0,
          customScale: 1.06,
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: { show: true },
              value: { show: true, fontSize: 48, fontFamily: 'Ubuntu', color: 'var(--color-text)', offsetY: 24 },
              total: { show: true, showAlways: true, fontSize: 14, label: t('dash.kpiOpenTicketsText'), fontFamily: 'Noto Sans JP', color: 'var(--color-text)', fontWeight: 700 }
            }
          }
        }
      }
    }
  })

  const ticketsBySourcePerDayOptions = computed(() => {
    // Use deterministic source order and normalization to align with data series
    const presentSources = new Set(store.filteredTickets.map(t => normalizeSource(t?.source)))
    const rawSources = SOURCE_ORDER.filter(src => presentSources.has(src))

    const colors = rawSources.map(src => getSourceColor(src))

    return {
      chart: {
        id: 'tickets-by-source-per-day',
        type: 'area',
        stacked: false,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors,
      xaxis: {
        type: 'datetime',
        tickAmount: 10,
        labels: {
          format: 'dd MMM',
          rotate: -45
        },
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        decimalsInFloat: 0
      },
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: 'smooth' },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        itemMargin: { horizontal: 32, vertical: 4 }
      },
      grid: { borderColor: 'var(--color-subtext)' },
      tooltip: {
        enabled: true,
        x: { format: 'dd MMM yyyy' }
      },
      fill: {
        type: 'gradient',
        gradient: {
          gradientToColors: ['var(--color-menu-background)'],
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 85, 100]
        }
      }
    }
  })

  const avgFirstResponseTimeOptions = computed(() => ({
    chart: {
      id: 'response-time',
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    xaxis: {
      type: 'datetime',
      tickAmount: 10,
      labels: {
        format: 'dd MMM',
        rotate: -45
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      decimalsInFloat: 0,
      labels: {
        formatter: (value) => {
          if (value == null || Number.isNaN(value)) return ''
          return `${Math.round(value)} ${t('base.minutesShortText')}`
        }
      }
    },
    colors: ['var(--color-highlight)', 'var(--color-third-complementary)'],
    stroke: { width: 2, curve: 'smooth' },
    legend: { position: 'top', horizontalAlign: 'left', itemMargin: { horizontal: 40 } },
    grid: { borderColor: 'var(--color-subtext)' },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: 'dd MMM yyyy' },
      y: {
        formatter: (value) => {
          if (value == null || Number.isNaN(value)) return t('dash.kpiNoDataText')
          return `${Math.round(value)} ${t('base.minutesShortText')}`
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        gradientToColors: ['var(--color-menu-background)'],
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 85, 100]
      }
    }
  }))

  const avgResolutionTimeOptions = computed(() => ({
    chart: {
      id: 'resolution-time',
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    xaxis: {
      type: 'datetime',
      tickAmount: 10,
      labels: {
        format: 'dd MMM',
        rotate: -45
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      decimalsInFloat: 0,
      labels: {
        formatter: (value) => {
          if (value == null || Number.isNaN(value)) return ''
          return `${Math.round(value)} ${t('base.minutesShortText')}`
        }
      }
    },
    colors: ['var(--color-highlight)', 'var(--color-third-complementary)'],
    stroke: { width: 2, curve: 'smooth' },
    legend: { position: 'top', horizontalAlign: 'left', itemMargin: { horizontal: 40 } },
    grid: { borderColor: 'var(--color-subtext)' },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: 'dd MMM yyyy' },
      y: {
        formatter: (value) => {
          if (value == null || Number.isNaN(value)) return t('dash.kpiNoDataText')
          return `${Math.round(value)} ${t('base.minutesShortText')}`
        }
      }
    }
  }))

  /**
   * ===============================
   * EXPORT INTERFACE
   * ===============================
   */
  return {
    DASHBOARD_TITLES,
    // KPI
    cards,
    // Charts
    createdByDaySeries,
    openedByDaySeries,
    contractDivideSeries,
    ticketTypeSeries,
    ticketPrioritySeries,
    ticketStatusSeries,
    ticketsBySourcePerDaySeries,
    avgFirstResponseTimeSeries,
    avgResolutionTimeSeries,
    // Chart options
    createdByDayOptions,
    openedByDayOptions,
    contractDivideOptions,
    ticketTypeOptions,
    ticketPriorityOptions,
    ticketStatusOptions,
    ticketsBySourcePerDayOptions,
    avgFirstResponseTimeOptions,
    avgResolutionTimeOptions
  }
}