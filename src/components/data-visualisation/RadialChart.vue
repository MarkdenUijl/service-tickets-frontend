<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { baseOptions, deepMerge, isNumberArray } from '@/utils/chartUtils.js'

const apexchart = VueApexCharts
const chartRef = ref(null)
const containerRef = ref(null)
let resizeObs = null

const props = defineProps({
  type: { type: String, default: 'donut' },
  series: { type: Array, default: () => [] },
  width: { type: [Number, String], default: '100%' },
  height: { type: [Number, String], default: '100%' },
  options: { type: Object, default: () => ({}) },
  chartId: { type: String, default: '' },
  showTotals: { type: Boolean, default: false }
})

const normalized = computed(() => {
  let seriesOut = props.series
  const extraOptions = {}

  if (isNumberArray(props.series)) {
    seriesOut = props.series
  } else if (Array.isArray(props.series) && props.series.length && typeof props.series[0] === 'object') {
    const labels = []
    const values = []
    for (const item of props.series) {
      const label = item.label ?? item.name
      const value = item.value ?? item.y
      if (typeof value === 'number') {
        values.push(value)
        labels.push(label ?? String(values.length))
      }
    }
    if (values.length) {
      seriesOut = values
      if (!props.options?.labels) {
        extraOptions.labels = labels
      }
    }
  }
  return { series: seriesOut, extraOptions }
})

const pieOffsetY = ref(0)
const isSemiDonut = computed(() => {
  const userPie = props.options?.plotOptions?.pie || {}
  const basePie = baseOptions.plotOptions?.pie || {}
  const start = userPie.startAngle ?? basePie.startAngle
  const end = userPie.endAngle ?? basePie.endAngle
  const t = String(props.type || '').toLowerCase()
  const isPieType = ['pie', 'donut'].includes(t)
  return isPieType && typeof start === 'number' && typeof end === 'number' && Math.abs(end - start) === 180
})

const mergedOptions = computed(() => {
  const withId = props.chartId ? deepMerge(baseOptions, { chart: { id: props.chartId } }) : { ...baseOptions }
  const dynamic = isSemiDonut.value ? { plotOptions: { pie: { offsetY: pieOffsetY.value } } } : {}
  return deepMerge(withId, deepMerge(props.options, deepMerge(normalized.value.extraOptions, dynamic)))
})

const legendBoxes = ref([])
const canShowTotals = computed(() => props.showTotals && Array.isArray(normalized.value.series))
const seriesTotals = computed(() => {
  if (!canShowTotals.value) return []
  return normalized.value.series.map(v => (typeof v === 'number' ? v : 0))
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

let legendObserver = null
const attachLegendObserver = () => {
  const legend = containerRef.value?.querySelector('.apexcharts-legend')
  if (!legend) return
  legendObserver = new MutationObserver(() => requestAnimationFrame(recomputeLegendBoxes))
  legendObserver.observe(legend, { attributes: true, childList: true, subtree: true, characterData: true })
}
const detachLegendObserver = () => {
  if (legendObserver) { legendObserver.disconnect(); legendObserver = null }
}

const updateChartSize = () => {
  const inst = chartRef.value?.chart
  if (inst?.updateOptions) inst.updateOptions({}, true, true)
  else window.dispatchEvent(new Event('resize'))
}

const recomputeSemiDonutOffset = () => {
  if (!isSemiDonut.value) { pieOffsetY.value = 0; return }
  const container = containerRef.value
  const svg = container?.querySelector('.apexcharts-svg')
  if (!svg) { pieOffsetY.value = 0; return }
  const h = svg.getBoundingClientRect().height || 0
  pieOffsetY.value = Math.round(h * 0.2)
}

const handleResize = () => requestAnimationFrame(() => {
  updateChartSize()
  recomputeLegendBoxes()
  recomputeSemiDonutOffset()
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
        :key="chartId || 'radial-chart'"
        :id="chartId"
        :type="type"
        :series="normalized.series"
        :options="mergedOptions"
        :width="width"
        :height="height"
        class="radial-chart"
        @mounted="recomputeLegendBoxes"
        @updated="recomputeLegendBoxes"
        @animationEnd="recomputeLegendBoxes"
        @dataPointSelection="recomputeLegendBoxes"
        @legendClick="recomputeLegendBoxes"
      />
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

.apexcharts-tooltip {
  color: var(--color-menu-background) !important;
  background-color: var(--color-text) !important;
  border: none !important;
}

.apexcharts-datalabel-value { font-weight: 800 !important; }
.apexcharts-datalabel-label { font-weight: 400 !important; }

.chart-holder .apexcharts-pie .apexcharts-series {
  transition: transform 160ms ease;
  transform-origin: 50% 50%;
  will-change: transform;
}

.chart-holder .apexcharts-pie .apexcharts-series:hover {
  transform: scale(1.035);
}

.chart-holder .apexcharts-svg,
.chart-holder .apexcharts-canvas {
  overflow: visible !important;
}
</style>