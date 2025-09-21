import { ref, computed } from 'vue'

export function useLegendTotals(containerRef, normalizedSeries, showTotals) {
  const legendBoxes = ref([])

  const canShowTotals = computed(() => showTotals.value && Array.isArray(normalizedSeries.value))
  const seriesTotals = computed(() => {
    if (!canShowTotals.value) return []
    return normalizedSeries.value.map(s =>
      Array.isArray(s?.data) ? s.data.reduce((a, v) => a + (Number.isFinite(v) ? v : 0), 0) : (typeof s === 'number' ? s : 0)
    )
  })

  const recomputeLegendBoxes = () => {
    if (!canShowTotals.value) {
      legendBoxes.value = []
      return
    }
    const container = containerRef.value
    if (!container) return
    const legend = container.querySelector('.apexcharts-legend')
    if (!legend) {
      legendBoxes.value = []
      return
    }
    const containerRect = container.getBoundingClientRect()
    legendBoxes.value = Array.from(legend.querySelectorAll('.apexcharts-legend-series')).map(el => {
      const r = el.getBoundingClientRect()
      return {
        left: (r.left + r.width / 2) - containerRect.left,
        top: (r.bottom - containerRect.top) + 4
      }
    })
  }

  return { legendBoxes, canShowTotals, seriesTotals, recomputeLegendBoxes }
}