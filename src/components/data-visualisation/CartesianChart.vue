<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { baseOptions, deepMerge, isNumberArray, makeBaseOptions, updateChartSize, normalizeCartesianSeries } from '@/utils/chartUtils.js'
import { useLegendTotals } from '@/composables/useLegendTotals'

const apexchart = VueApexCharts
const chartRef = ref(null)
const containerRef = ref(null)

let resizeObs = null
let legendObserver = null

const normalizedSeries = computed(() => normalizeCartesianSeries(props.series))

const { legendBoxes, canShowTotals, seriesTotals, recomputeLegendBoxes } =
  useLegendTotals(
    containerRef,
    normalizedSeries,
    computed(() => props.showTotals)
  );

const props = defineProps({
  type: { type: String, default: 'bar' },
  series: { type: Array, default: () => [] },
  width: { type: [Number, String], default: '100%' },
  height: { type: [Number, String], default: '100%' },
  options: { type: Object, default: () => ({}) },
  chartId: { type: String, default: '' },
  showTotals: { type: Boolean, default: true }
})


const mergedOptions = computed(() => {
  const withId = props.chartId ? deepMerge(baseOptions, { chart: { id: props.chartId } }) : { ...baseOptions }
  return deepMerge(deepMerge(withId, makeBaseOptions(chartRef)), props.options)
})


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

const handleResize = () => requestAnimationFrame(() => {
  updateChartSize(chartRef)
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
        :series="normalizedSeries"
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
          :aria-label="`Total for ${normalizedSeries?.[idx]?.name ?? `series ${idx + 1}`}`"
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