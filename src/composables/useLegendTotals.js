import { ref, computed, unref } from 'vue'

/**
 * useLegendTotals
 *
 * Purpose
 * -------
 * ApexCharts does not expose legend item coordinates via its API, but we want
 * to display a per-series total *directly underneath each legend item*.
 * This composable derives those coordinates by measuring DOM elements and
 * exposes: (1) the pixel positions for labels, and (2) the per‑series totals.
 *
 * Why this design
 * ---------------
 * - **Single responsibility:** Only computes *totals* and *legend label positions*.
 *   It does not attach observers itself; callers decide *when* to recompute.
 * - **DOM measurement:** Legend layout is rendered by ApexCharts; measuring is
 *   the most robust, implementation-agnostic way to align our overlays.
 * - **Data-agnostic totals:** Works for cartesian series shaped like
 *   `{ name, data: number[] }` and radial-style series that can be plain numbers.
 *
 * @param {import('vue').Ref<HTMLElement|null>} containerRef
 *        The container that wraps the chart and the overlay layer.
 *        We compute positions *relative* to this element.
 * @param {import('vue').Ref<Array>|Array} normalizedSeries
 *        Series in a normalized shape. For cartesian, an array of objects with
 *        a `data: number[]` array. For radial, may be numbers.
 * @param {import('vue').Ref<boolean>|boolean} showTotals
 *        Whether totals overlay is enabled.
 * @param {Object} [opts]
 * @param {string} [opts.legendSelector='.apexcharts-legend']
 *        Selector for the legend root within the container.
 * @param {string} [opts.legendItemSelector='.apexcharts-legend-series']
 *        Selector for individual legend items.
 * @param {number} [opts.verticalOffset=4]
 *        Extra pixels to push labels below the legend items.
 *
 * @returns {{
 *   legendBoxes: import('vue').Ref<Array<{left:number, top:number}>>,
 *   canShowTotals: import('vue').ComputedRef<boolean>,
 *   seriesTotals: import('vue').ComputedRef<number[]>,
 *   recomputeLegendBoxes: () => void
 * }}
 */
export function useLegendTotals(
  containerRef,
  normalizedSeries,
  showTotals,
  opts = {}
) {
  // Config with sensible defaults, but overridable if ApexCharts changes markup
  const cfg = {
    legendSelector: '.apexcharts-legend',
    legendItemSelector: '.apexcharts-legend-series',
    verticalOffset: -8,
    ...opts
  }

  // Absolute (container-relative) positions for each legend item center-bottom
  const legendBoxes = ref([])

  // Guard: Only compute when totals are enabled *and* series look like an array
  const canShowTotals = computed(
    () => !!unref(showTotals) && Array.isArray(unref(normalizedSeries))
  )

  // Sum helper that ignores non-finite values instead of throwing off totals
  const sumFinite = (acc, v) => acc + (Number.isFinite(v) ? v : 0)

  // Per-series totals. Supports cartesian and radial-like data shapes.
  const seriesTotals = computed(() => {
    if (!canShowTotals.value) return []
    const seriesArr = unref(normalizedSeries)

    return seriesArr.map((s) => {
      // Cartesian: { name, data: number[] }
      if (Array.isArray(s?.data)) return s.data.reduce(sumFinite, 0)
      // Radial: series can be a number (already the total)
      if (typeof s === 'number') return s
      // Fallback for shapes like { value: number }
      if (Number.isFinite(s?.value)) return s.value
      return 0
    })
  })

  /**
   * Recompute legend item anchor boxes.
   *
   * We measure each `.apexcharts-legend-series` element and return a point
   * centered horizontally under the item and vertically just beneath it, all
   * coordinates relative to the **containerRef**. This keeps the overlay layer
   * decoupled from window scrolling and surrounding layout.
   */
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
        // Center X under the legend item
        left: r.left + r.width / 2 - containerRect.left,
        // A few pixels below the legend item
        top: r.bottom - containerRect.top + cfg.verticalOffset
      }
    })
  }

  return { legendBoxes, canShowTotals, seriesTotals, recomputeLegendBoxes }
}