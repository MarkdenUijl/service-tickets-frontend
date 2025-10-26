import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTicketsStore } from '@/stores/ticketStore'
import { getTicketTypeColor } from '@/constants/ticketColors'
import { capitalizeWords } from '@/utils/capitalizeWords'


export const DASHBOARD_TITLES = {
  bar: 'Tickets created',
  donut: 'Ticket type breakdown',
  area: 'Response time',
}

// Utility helper to group by day
const toDayKey = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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
    const totalOpen = tickets.filter(t => t.status === 'OPEN').length
    const escalated = tickets.filter(t => t.status === 'ESCALATED').length
    const awaiting  = tickets.filter(t => t.status === 'PENDING').length
    const clientRes = tickets.filter(t => t.status === 'IN_PROGRESS').length
    const unlinked  = tickets.filter(t => !t.projectId).length

    return [
      { cardTitle: t('dash.openTicketsText'), cardInfo: totalOpen },
      { cardTitle: t('dash.escalatedTicketsText'), cardInfo: escalated },
      { cardTitle: t('dash.awaitingResponseText'), cardInfo: awaiting },
      { cardTitle: t('dash.clientRespondedText'), cardInfo: clientRes },
      { cardTitle: t('dash.unlinkedTicketsText'), cardInfo: unlinked }
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
    const createdByDay = new Map()
    const closedByDay = new Map()

    for (const t of tickets) {
      const createdKey = toDayKey(t.createdAt)
      createdByDay.set(createdKey, (createdByDay.get(createdKey) || 0) + 1)
      if (t.closedAt) {
        const closedKey = toDayKey(t.closedAt)
        closedByDay.set(closedKey, (closedByDay.get(closedKey) || 0) + 1)
      }
    }

    const allDays = Array.from(new Set([...createdByDay.keys(), ...closedByDay.keys()])).sort()
    return {
      series: [
        { name: 'Created', data: allDays.map(k => createdByDay.get(k) || 0) },
        { name: 'Closed', data: allDays.map(k => closedByDay.get(k) || 0) }
      ],
      categories: allDays
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
    xaxis: { categories: barSeries.value.categories },
    plotOptions: { bar: { borderRadius: 2, borderRadiusApplication: 'end' } },
    colors: [
      'var(--color-secondary)',
      'var(--color-highlight)',
      'var(--color-first-complementary)',
      'var(--color-second-complementary)',
      'var(--color-third-complementary)'
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