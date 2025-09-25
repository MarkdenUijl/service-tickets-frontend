<script setup>
import { ref, watch } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { useI18n } from 'vue-i18n'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import SvgIcon from '../svg-icon/SvgIcon.vue'

const props = defineProps({
  modelValue: Array
})

const emit = defineEmits(['update:modelValue'])

const date = ref(props.modelValue)
const { t } = useI18n()
const isOpen = ref(false)
const selectedPresetName = ref(t('dash.fullRangeText'))

const now = () => new Date()

watch(
  () => props.modelValue,
  (val) => {
    date.value = val
    selectedPresetName.value = val ? t('dash.customRangeText') : t('dash.fullRangeText')
  },
  { immediate: true }
)

const presetMenuOptions = [
  {
    key: 'lastDay',
    name: t('dash.lastDayText'),
    getRange: () => {
      const end = now()
      const start = new Date(end)
      start.setDate(end.getDate() - 1)
      return [start, end]
    }
  },
  {
    key: 'lastWeek',
    name: t('dash.lastWeekText'),
    getRange: () => {
      const end = now()
      const start = new Date(end)
      start.setDate(end.getDate() - 7)
      return [start, end]
    }
  },
  {
    key: 'lastMonth',
    name: t('dash.lastMonthText'),
    getRange: () => {
      const end = now()
      const start = new Date(end)
      start.setMonth(end.getMonth() - 1)
      return [start, end]
    }
  },
  {
    key: 'lastYear',
    name: t('dash.lastYearText'),
    getRange: () => {
      const end = now()
      const start = new Date(end)
      start.setFullYear(end.getFullYear() - 1)
      return [start, end]
    }
  }
]

const handleDateChange = (modelData) => {
  date.value = modelData
  selectedPresetName.value = modelData ? t('dash.customRangeText') : t('dash.fullRangeText')
  emit('update:modelValue', date.value)
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const filterTogglePath = {
  closed: {
    d: 'M3,6 L8,11 L13,6',
    transition: { type: 'spring', stiffness: 200, damping: 16, bounce: 0.1 }
  },
  open: {
    d: 'M3,11 L8,6 L13,11',
    transition: { type: 'spring', stiffness: 200, damping: 32 }
  }
}
</script>

<template>
  <div class="datepicker-filter">
    <VueDatePicker
      name="date-range-picker"
      v-model="date"
      :range="true"
      :no-today="true"
      :enable-time-picker="false"
      :week-numbers="{ type: 'iso' }"
      :max-date="new Date()"
      format="dd MMM yyyy"
      @update:model-value="handleDateChange"
    >
      <template #input-icon>
        <SvgIcon class="input-slot-image" name="calendar-icon" width="16px" height="16px" />
      </template>
    </VueDatePicker>

    <div
      class="date-range-presets"
      @click.stop="toggleMenu"
      :class="{ open: isOpen }"
    >
      {{ selectedPresetName }}
      <svg class="svg-arrow" width="16" height="16" viewBox="0 0 16 16">
        <motion.path
          stroke="var(--color-text)"
          stroke-width="2"
          stroke-linecap="round"
          :variants="filterTogglePath"
          :initial="'closed'"
          fill="transparent"
          :animate="isOpen ? 'open' : 'closed'"
        />
      </svg>
    </div>

    <AnimatePresence>
      <motion.div
        v-if="isOpen"
        class="date-preset-selection-menu"
        v-click-outside="() => (isOpen = false)"
        :initial="'closed'"
        :animate="'open'"
        :exit="'closed'"
        :variants="{
          open: {
            height: 'auto',
            transformOrigin: 'top',
            transition: { staggerChildren: 0.1 }
          },
          closed: {
            height: 0,
            transformOrigin: 'top',
            transition: {
              delay: 0.15,
              duration: 0.4,
              staggerChildren: 0.1,
              staggerDirection: -1
            }
          }
        }"
      >
        <motion.div
          v-for="presetOption in presetMenuOptions"
          :key="presetOption.key"
          class="date-preset-option"
          @click="() => {
            handleDateChange(presetOption.getRange())
            selectedPresetName = presetOption.name
            isOpen = false
          }"
          :variants="{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -10 } }"
        >
          {{ presetOption.name }}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style>
.datepicker-filter {
  display: flex;
  flex-direction: row;
  font-family: 'Noto sans JP';
  font-size: 11px;
  min-width: 320px;
  position: relative;
  user-select: none;
}

.date-range-presets {
  min-width: 120px;
  background: var(--color-menu-background);
  border: 1px solid var(--vt-c-offwhite);
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding-left: 16px;
  align-items: center;
  font-weight: 600;
  position: relative;
}

.date-range-presets.open {
  border-radius: 0 4px 0 0;
}

.svg-arrow {
  background: none;
  overflow: visible;
  pointer-events: none;
  position: absolute;
  right: 8px;
  top: 50%;
  translate: 0 -50%;
}

.input-slot-image {
  margin-left: 12px;
  color: var(--color-text);
}

.date-preset-selection-menu {
  position: absolute;
  right: 0;
  width: 75%;
  top: 100%;
  z-index: 20;
  border: 1px solid var(--vt-c-offwhite);
  border-top: none;
  background-color: var(--color-menu-background);
  border-radius: 0 0 4px 4px;
}

.date-preset-option {
  padding: 8px 12px;
  cursor: pointer;
}

.date-preset-option:hover {
  background-color: var(--color-shadow);
}

/* root settings for datepicker only */
:root {
  --dp-border-radius: 4px 0 0 4px;
  --dp-font-family: 'Noto sans JP';
  --dp-font-size: 11px;
}

.dp__theme_light {
  --dp-background-color: var(--color-menu-background);
  --dp-text-color: var(--color-text-color);
  --dp-primary-color: var(--color-highlight);
  --dp-hover-color: #f3f3f3;
  --dp-hover-text-color: #212121;
  --dp-disabled-color: var(--vt-c-pink);
  --dp-border-color: var(--vt-c-offwhite);
  --dp-range-between-dates-background-color: var(--color-shadow);
  --dp-range-between-dates-text-color: var(--text-color);
  --dp-range-between-border-color: none;
}
</style>