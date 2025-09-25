<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { baseOptions, deepMerge, updateChartSize, normalizeRadialSeries } from '@/utils/chartUtils.js'

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

const normalizedSeries = computed(() => normalizeRadialSeries(props.series, props.options))

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
  return deepMerge(withId, deepMerge(props.options, deepMerge(normalizedSeries.value.extraOptions, dynamic)))
})

const recomputeSemiDonutOffset = () => {
  if (!isSemiDonut.value) { pieOffsetY.value = 0; return }
  const container = containerRef.value
  const svg = container?.querySelector('.apexcharts-svg')
  if (!svg) { pieOffsetY.value = 0; return }
  const h = svg.getBoundingClientRect().height || 0
  pieOffsetY.value = Math.round(h * 0.2)
}

const handleResize = () => requestAnimationFrame(() => {
  updateChartSize(chartRef)
  recomputeSemiDonutOffset()
})

onMounted(async () => {
  await nextTick()
  if (containerRef.value && 'ResizeObserver' in window) {
    resizeObs = new ResizeObserver(() => handleResize())
    resizeObs.observe(containerRef.value)
  }
  handleResize()
  window.addEventListener('resize', handleResize, { passive: true })
})

onBeforeUnmount(() => {
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
        :series="normalizedSeries.series"
        :options="mergedOptions"
        :width="width"
        :height="height"
        class="radial-chart"
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