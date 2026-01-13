import { ref, computed, unref } from 'vue'

export function useLegendTotals(
  containerRef,
  normalizedSeries,
  showTotals,
  opts = {}
) {
  const cfg = {
    legendSelector: '.apexcharts-legend',
    legendItemSelector: '.apexcharts-legend-series',
    verticalOffset: -8,
    ...opts
  }

  const legendBoxes = ref([])

  const canShowTotals = computed(
    () => !!unref(showTotals) && Array.isArray(unref(normalizedSeries))
  )

  const seriesTotals = computed(() => {
    if (!canShowTotals.value) return []
    const seriesArr = unref(normalizedSeries)

    return seriesArr.map((s) => {
      if (Array.isArray(s?.data)) {
        return s.data.reduce((acc, v) => {
          if (typeof v === 'number') return acc + v
          if (Array.isArray(v)) return acc + (Number.isFinite(v[1]) ? v[1] : 0)
          if (v && typeof v === 'object' && Number.isFinite(v.y)) return acc + v.y
          return acc
        }, 0)
      }
      if (typeof s === 'number') return s

      if (Number.isFinite(s?.value)) return s.value
      return 0
    })
  })

  const recomputeLegendBoxes = () => {
    if (!canShowTotals.value) {
      legendBoxes.value = []
      return
    }

    const container = unref(containerRef)
    if (!container) return

    const legend = container.querySelector(cfg.legendSelector)
    if (!legend) {
      legendBoxes.value = []
      return
    }

    const containerRect = container.getBoundingClientRect()
    const items = legend.querySelectorAll(cfg.legendItemSelector)

    legendBoxes.value = Array.from(items).map((el) => {
      const r = el.getBoundingClientRect()
      return {
        left: r.left + r.width / 2 - containerRect.left,
        top: r.bottom - containerRect.top + cfg.verticalOffset
      }
    })
  }

  return { legendBoxes, canShowTotals, seriesTotals, recomputeLegendBoxes }
}