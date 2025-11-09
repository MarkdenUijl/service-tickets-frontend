<script setup>
import { GridLayout } from 'grid-layout-plus'
import { ref, computed, watch, onMounted } from 'vue'
import { motion } from 'motion-v'
import { useI18n } from 'vue-i18n'
import { useTicketsStore } from '@/stores/ticketStore'

import CartesianChart from '@/components/data-visualisation/CartesianChart.vue'
import RadialChart from '@/components/data-visualisation/RadialChart.vue'
import DashboardDataTile from '@/components/data-visualisation/DashboardDataTile.vue'
import DashboardCarousel from '@/components/data-visualisation/DashboardCarousel.vue'
import RouteInfo from '@/components/common/RouteInfo.vue'
import FilterDatePicker from '@/components/user-input/FilterDatePicker.vue'

import { useWindowSize } from '@/composables/useWindowSize'
import { useStableSize } from '@/composables/useStableSize'
import { useDashboardData } from '@/composables/useDashboardData'
import SearchCombo from '@/components/user-input/SearchCombo.vue'

// --- UI State
const STORAGE_KEY = 'dashboardTileLayout'
const maxTilesAmount = 9

const isChecked = ref(false)
const dateRange = ref(null)
const searchInput = ref('')
const { t } = useI18n()
const ticketsStore = useTicketsStore()

// layout state
const savedLayout = localStorage.getItem(STORAGE_KEY)
const layout = ref(
  savedLayout
    ? JSON.parse(savedLayout)
    : [
        { x: 0, y: 0, w: 1, h: 1, i: '0', type: 'bar' },
        { x: 1, y: 0, w: 1, h: 1, i: '1', type: 'bar' }
      ]
)

const {
  DASHBOARD_TITLES,
  cards,
  barSeries,
  donutSeries,
  areaSeries,
  barOptions,
  donutOptions,
  areaOptions
} = useDashboardData()

// Keep a copy of the original grid to restore after mobile single-column mode
const originalLayout = ref(null)

// --- Responsive sizing (computed; no imperative resize handlers)
const wrapperRef = ref(null)
const { width: wrapperWidth } = useStableSize(wrapperRef, 150)
const { windowWidth } = useWindowSize()

const isMobile = computed(() => windowWidth.value <= 635)
const colNum = computed(() => (isMobile.value ? 1 : 3))

// Row height rule kept from original: 90% of viewport width on 1-col, else 0.75 * (containerWidth / cols)
const rowHeight = computed(() => {
  const fallback = 240
  if (colNum.value === 1) return Math.floor((windowWidth.value || 0) * 0.9) || fallback
  const w = wrapperWidth.value || 0
  return w > 0 ? Math.floor((w / colNum.value) * 0.75) : fallback
})

// --- Persistence
watch(
  layout,
  (newLayout) => {
    // Do not overwrite saved layout while we are in mobile compact mode
    if (!originalLayout.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout))
    }
  },
  { deep: true }
)

// --- Grid packing (kept local for clarity; small & self-contained)
const packLayout = (items, cols) => {
  const grid = []
  const packed = []

  const isFree = (x, y, w, h) => {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const row = grid[y + dy] || []
        if (row[x + dx]) return false
      }
    }
    return true
  }

  const occupy = (id, x, y, w, h) => {
    for (let dy = 0; dy < h; dy++) {
      if (!grid[y + dy]) grid[y + dy] = []
      for (let dx = 0; dx < w; dx++) grid[y + dy][x + dx] = id
    }
  }

  for (const tile of items) {
    let placed = false
    for (let y = 0; !placed; y++) {
      for (let x = 0; x <= cols - tile.w; x++) {
        if (isFree(x, y, tile.w, tile.h)) {
          packed.push({ ...tile, x, y })
          occupy(tile.i, x, y, tile.w, tile.h)
          placed = true
          break
        }
      }
    }
  }

  return packed
}

// --- DRY helper to update & repack the layout
const applyLayoutUpdate = (mapper) => {
  const updated = layout.value.map(mapper)
  // keep visual order stable (top-left first) before packing
  updated.sort((a, b) => a.y - b.y || a.x - b.x)
  layout.value = packLayout(updated, colNum.value)
}

// --- Actions
const addLayoutTile = () => {
  const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`
  isChecked.value = true
  layout.value = packLayout(
    [
      ...layout.value,
      { x: 0, y: 0, w: 1, h: 1, i: uniqueId, type: 'bar' }
    ],
    colNum.value
  )
  setTimeout(() => (isChecked.value = false), 1500)
}

const deleteLayoutTile = (id) => {
  layout.value = packLayout(layout.value.filter((t) => t.i !== id), colNum.value)
}

const handleResizeRequest = ({ id, w, h }) => {
  applyLayoutUpdate((tile) => (tile.i === id ? { ...tile, w, h } : tile))
}

const handleChangeType = ({ id, type }) => {
  applyLayoutUpdate((tile) => (tile.i === id ? { ...tile, type } : tile))
}

const handleClearPreferences = () => {
  searchInput.value = ''
  dateRange.value = null
}

// On mobile switch: compress to 1x1 and remember original; restore when leaving mobile
watch(
  isMobile,
  (mobile) => {
    if (mobile) {
      if (!originalLayout.value) originalLayout.value = JSON.parse(JSON.stringify(layout.value))
      layout.value = packLayout(
        layout.value.map((t) => ({ ...t, w: 1, h: 1 })),
        colNum.value
      )
    } else if (originalLayout.value) {
      layout.value = JSON.parse(JSON.stringify(originalLayout.value))
      originalLayout.value = null
      layout.value = packLayout(layout.value, colNum.value)
    }
  },
  { immediate: true }
)

// --- Demo chart data & options (kept local; can be moved to utils later if reused)
const demoSeries = [
  { name: 'created', data: [10, 20, 5, 30, 40, 25] },
  { name: 'closed', data: [8, 15, 7, 28, 35, 20] }
]

const OPTIONS_BY_TYPE = { bar: barOptions, area: areaOptions, donut: donutOptions }
const DEFAULT_SERIES_TYPES = new Set(['bar', 'line', 'area', 'scatter'])

const getSeriesForType = (type) => {
  switch (type) {
    case 'bar':
      return barSeries.value.series || []
    case 'area':
      return areaSeries.value.series || []
    case 'donut':
      return donutSeries.value || []
    default:
      return []
  }
}

const getOptionsForType = (type) => {
  switch (type) {
    case 'bar':
      return barOptions.value || {}
    case 'area':
      return areaOptions.value || {}
    case 'donut':
      return donutOptions.value || {}
    default:
      return {}
  }
}

// Add button icon variants
const iconVariants = {
  plus: { d: 'M12 5v14M5 12h14', rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
  check: { d: 'M5 13l4 4L19 7', rotate: 365, transition: { type: 'spring', stiffness: 200, damping: 20 } }
}


const demoItems = [
  'Lighting commissioning - Building A',
  'Emergency callout - Plant room',
  'Fault diagnostics - Floor 3',
  'Sensor calibration - West wing',
  'DALI loop check - Warehouse',
  'As-built update - Atrium',
  'Driver replacement - Block C',
  'Energy audit - HQ campus',
  'Scene programming - Auditorium',
  'Warranty ticket - Panel LCP-12'
]

onMounted(() => {
  ticketsStore.fetchAll()
})
</script>

<template>
  <div class="dashboard-view-wrapper" ref="wrapperRef">
    <div class="dashboard-header-items">
      <RouteInfo />
      <SearchCombo v-model="searchInput" :placeholder="t('dash.searchProjectsText')" :items="demoItems"/>
      
      <FilterDatePicker v-model="dateRange" />
      <motion.button class="clear-filter-button" @click="handleClearPreferences" :while-press="{ scale: 0.97 }">
        {{ t('dash.clearPreferencesText') }}
      </motion.button>
    </div>

    <DashboardCarousel :cards="cards" />

    <GridLayout
      v-model:layout="layout"
      :col-num="colNum"
      :row-height="rowHeight"
      is-draggable
      :is-resizable="false"
      vertical-compact
      use-css-transforms
      :prevent-collision="false"
    >
      <DashboardDataTile
        v-for="item in layout"
        :key="item.i"
        :header="DASHBOARD_TITLES[item.type] || 'Dashboard Data'"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        @resizeRequest="handleResizeRequest"
        @changeTypeRequest="handleChangeType"
        @deletionRequest="deleteLayoutTile"
      >
        <component
          :is="DEFAULT_SERIES_TYPES.has(item.type) ? CartesianChart : RadialChart"
          :chartId="item.i"
          :type="item.type"
          :series="getSeriesForType(item.type)"
          :options="getOptionsForType(item.type)"
        />
      </DashboardDataTile>
    </GridLayout>

    <motion.button
      v-if="layout.length < maxTilesAmount"
      class="add-menu-tile-button"
      :class="isChecked ? 'checked' : ''"
      @click="addLayoutTile"
      :disabled="isChecked"
      :initial="false"
      :animate="isChecked ? 'checked' : 'default'"
      :variants="{ default: { backgroundColor: 'var(--color-highlight)' }, checked: { backgroundColor: 'var(--vt-c-green)' } }"
      :transition="{ duration: 0.5 }"
    >
      <motion.svg class="add-menu-checkmark" viewBox="0 0 24 24" width="24" height="24">
        <motion.path
          stroke="white"
          fill="transparent"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          :initial="false"
          :animate="isChecked ? 'check' : 'plus'"
          :variants="iconVariants"
        />
      </motion.svg>
    </motion.button>
  </div>
</template>

<style scoped>
.clear-filter-button {
  background-color: var(--color-menu-background);
  color: var(--text-color);
  font-size: 11px;
  font-weight: 700;
  font-family: 'Noto Sans JP';
  padding: 6px 24px;
  border: 1px solid var(--vt-c-offwhite);
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.add-menu-tile-button {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 32px;
  right: 0px;
  padding: 8px 12px;
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.25);
  border-radius: 4px 0 0 4px;
  cursor: pointer;
}

.add-menu-tile-button.checked { cursor: default; }

.add-menu-checkmark { background: none; overflow: visible; pointer-events: none; }
</style>