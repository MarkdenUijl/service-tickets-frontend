<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { baseOptions, deepMerge, isNumberArray, makeBaseOptions } from '@/utils/chartUtils.js'

const apexchart = VueApexCharts
const chartRef = ref(null)
const containerRef = ref(null)
const legendBoxes = ref([])

let resizeObs = null
let legendObserver = null

const props = defineProps({
  type: { type: String, default: 'bar' },
  series: { type: Array, default: () => [] },
  width: { type: [Number, String], default: '100%' },
  height: { type: [Number, String], default: '100%' },
  options: { type: Object, default: () => ({}) },
  chartId: { type: String, default: '' },
  showTotals: { type: Boolean, default: true }
})

// --- normalize input ---
const normalized = computed(() => {
  let seriesOut = props.series
  if (isNumberArray(props.series)) {
    seriesOut = [{ name: 'Series 1', data: props.series }]
  }
  return { series: seriesOut }
})

// --- merge options ---
const mergedOptions = computed(() => {
  const withId = props.chartId ? deepMerge(baseOptions, { chart: { id: props.chartId } }) : { ...baseOptions }
  return deepMerge(deepMerge(withId, makeBaseOptions(chartRef)), props.options)
})

// --- totals logic ---
const canShowTotals = computed(() => props.showTotals && Array.isArray(normalized.value.series))

const seriesTotals = computed(() => {
  if (!canShowTotals.value) return []
  return (normalized.value.series || []).map(s =>
    (s && Array.isArray(s.data) ? s.data : []).reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0)
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
  const items = Array.from(legend.querySelectorAll('.apexcharts-legend-series'))
  legendBoxes.value = items.map(el => {
    const r = el.getBoundingClientRect()
    return {
      left: (r.left + r.width / 2) - containerRect.left,
      top: (r.bottom - containerRect.top) + 4
    }
  })
}

const attachLegendObserver = () => {
  const legend = containerRef.value?.querySelector('.apexcharts-legend')
  if (!legend) return
  legendObserver = new MutationObserver(() => requestAnimationFrame(recomputeLegendBoxes))
  legendObserver.observe(legend, { attributes: true, childList: true, subtree: true, characterData: true })
}

const detachLegendObserver = () => {
  if (legendObserver) {
    legendObserver.disconnect()
    legendObserver = null
  }
}

// --- resize handling ---
const updateChartSize = () => {
  const inst = chartRef.value?.chart
  if (inst?.updateOptions) inst.updateOptions({}, true, true)
  else window.dispatchEvent(new Event('resize'))
}

const handleResize = () => requestAnimationFrame(() => {
  updateChartSize()
  recomputeLegendBoxes()
})

onMounted(async () => {
  await nextTick()
  attachLegendObserver()
  if (containerRef.value && 'ResizeObserver' in window) {
    resizeObs = new ResizeObserver(() => handleResize())
    resizeObs.observe(containerRef.value)
  }
  handleResize()
  window.addEventListener('resize', handleResize, { passive: true })
})

onBeforeUnmount(() => {
  detachLegendObserver()
  if (resizeObs) { resizeObs.disconnect(); resizeObs = null }
  window.removeEventListener('resize', handleResize)
})

watch(
  () => [props.series, props.options, props.showTotals, props.type, props.width, props.height],
  async () => { await nextTick(); handleResize() },
  { deep: true }
)
</script>

<template>
  <div class="dv-container" ref="containerRef">
    <div class="chart-holder">
      <apexchart
        ref="chartRef"
        :key="chartId || 'chart'"
        :id="chartId"
        :type="type"
        :series="normalized.series"
        :options="mergedOptions"
        :width="width"
        :height="height"
        class="testing-chart"
        @mounted="recomputeLegendBoxes"
        @updated="recomputeLegendBoxes"
        @animationEnd="recomputeLegendBoxes"
        @dataPointSelection="recomputeLegendBoxes"
        @legendClick="recomputeLegendBoxes"
      />
    </div>

    <div
      class="legend-totals-layer"
      v-show="canShowTotals && legendBoxes.length"
      aria-hidden="false"
    >
      <template v-for="(pos, idx) in legendBoxes" :key="`legend-total-${idx}`">
        <div
          class="legend-total-label"
          :style="{ left: `${pos.left}px`, top: `${pos.top}px` }"
          :aria-label="`Total for ${normalized.series?.[idx]?.name ?? `series ${idx + 1}`}`"
        >
          {{ seriesTotals[idx] ?? '' }}
        </div>
      </template>
    </div>
  </div>
</template>

<style>
.dv-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.chart-holder {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.legend-totals-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.legend-total-label {
  position: absolute;
  transform: translateX(-50%);
  padding: 2px 6px;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.apexcharts-tooltip {
  color: var(--color-menu-background) !important;
  background-color: var(--color-text) !important;
  border: none !important;
}

.apexcharts-datalabel-value {
  font-weight: 800 !important;
}

.apexcharts-datalabel-label {
  font-weight: 400 !important;
}
</style>