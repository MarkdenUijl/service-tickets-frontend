import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTicketsStore } from '@/stores/ticketStore'
import { getTicketTypeColor } from '@/constants/ticketColors.js'
import { capitalizeWords } from '@/utils/capitalizeWords'

export const DASHBOARD_TITLES = {
  bar: 'Tickets created',
  donut: 'Ticket type breakdown',
  area: 'Response time',
}

const formatLabel = dateStr => {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Utility helper to group by day
const toDayKey = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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

  for (const t of tickets) {
    totalCount++

    // Tickets with contract: project has a serviceContract object
    if (t?.hadValidContractAtCreation === true) {
      withContractCount++
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
    contractTicketPercent
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
 * Centralized data layer for the dashboard.
 * It transforms tickets from the store into KPIs and chart-ready datasets.
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

    const { openCount, avgResolutionMs, avgFirstResponseMs, contractTicketPercent } = computeKpiMetrics(tickets)

    const avgResolutionLabel = formatDurationForCard(avgResolutionMs, t)
    const avgFirstResponseLabel = formatDurationForCard(avgFirstResponseMs, t)
    const contractPercentLabel = formatPercentForCard(contractTicketPercent)

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
      }
    ]
  })

  /**
   * ===============================
   * CHART SERIES BUILDERS
   * ===============================
   */

  // --- Bar chart: tickets created vs closed per day
  const barSeries = computed(() => {
    const tickets = store.filteredTickets
    if (!tickets.length) return { series: [], categories: [] }

    const createdByDay = new Map()
    const closedByDay = new Map()

    for (const t of tickets) {
      const createdKey = toDayKey(t.creationDate)
      createdByDay.set(createdKey, (createdByDay.get(createdKey) || 0) + 1)

      if (t.closingDate) {
        const closedKey = toDayKey(t.closingDate)
        closedByDay.set(closedKey, (closedByDay.get(closedKey) || 0) + 1)
      }
    }

    // Find date range: first created ticket → today
    const firstDate = new Date(Math.min(...tickets.map(t => new Date(t.creationDate))))
    const endDate = store.dateRange?.end ? new Date(store.dateRange.end) : new Date()
    endDate.setHours(0, 0, 0, 0)

    // Build full list of dates between first and today
    const allDays = []
    const current = new Date(firstDate)
    current.setHours(0, 0, 0, 0)

    while (current <= endDate) {
      allDays.push(toDayKey(current))
      current.setDate(current.getDate() + 1)
    }

    // Construct the data arrays with 0 for missing days
    const createdData = allDays.map(day => [new Date(day).getTime(), createdByDay.get(day) || 0])
    const closedData = allDays.map(day => [new Date(day).getTime(), closedByDay.get(day) || 0])


    return {
      series: [
        { name: 'Created', data: createdData },
        { name: 'Closed', data: closedData }
      ],
      categories: allDays.map(formatLabel)
    }
  })

  // --- Donut chart: ticket type breakdown
  const donutSeries = computed(() => {
    const tickets = store.filteredTickets
    const countByType = new Map()

    for (const t of tickets) {
      const key = t.type || 'Unknown'
      countByType.set(key, (countByType.get(key) || 0) + 1)
    }

    return Array
      .from(countByType.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label))
  })

  // --- Area chart: response time per day (with vs without contract)
  const areaSeries = computed(() => {
    const tickets = store.filteredTickets
    const grouped = new Map()

    const add = (k, bucket, hours) => {
      if (!grouped.has(k)) grouped.set(k, { with: { sum: 0, n: 0 }, without: { sum: 0, n: 0 } })
      grouped.get(k)[bucket].sum += hours
      grouped.get(k)[bucket].n += 1
    }

    for (const t of tickets) {
      if (!t.firstResponseAt) continue
      const key = toDayKey(t.createdAt)
      const hours = (new Date(t.firstResponseAt) - new Date(t.createdAt)) / (1000 * 60 * 60)
      const bucket = (t.hasContract && t.contractValid) ? 'with' : 'without'
      add(key, bucket, Math.max(0, hours))
    }

    const days = Array.from(grouped.keys()).sort()
    const withC = days.map(k => {
      const { sum, n } = grouped.get(k).with
      return n ? +(sum / n).toFixed(2) : 0
    })
    const withoutC = days.map(k => {
      const { sum, n } = grouped.get(k).without
      return n ? +(sum / n).toFixed(2) : 0
    })

    return {
      series: [
        { name: 'With contract', data: withC },
        { name: 'Without contract', data: withoutC }
      ],
      categories: days
    }
  })

  /**
   * ===============================
   * CHART OPTIONS BUILDERS
   * ===============================
   */
  const barOptions = computed(() => ({
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

  const donutOptions = computed(() => {
    const rawLabels = donutSeries.value.map(item => capitalizeWords(item.label))
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
              total: { show: true, showAlways: true, fontSize: 14, label: 'Total tickets', fontFamily: 'Noto Sans JP', color: 'var(--color-text)', fontWeight: 700 }
            }
          }
        }
      }
    }
  })

  const areaOptions = computed(() => ({
    chart: { id: 'response-time' },
    xaxis: { categories: areaSeries.value.categories },
    colors: ['var(--color-highlight)', 'var(--color-third-complementary)'],
    stroke: { width: 2 },
    legend: { position: 'top', horizontalAlign: 'left', itemMargin: { horizontal: 40 } },
    grid: { borderColor: 'var(--color-subtext)' },
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
    barSeries,
    donutSeries,
    areaSeries,
    // Chart options
    barOptions,
    donutOptions,
    areaOptions
  }
}