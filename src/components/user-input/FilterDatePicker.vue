<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import SvgIcon from '../svg-icon/SvgIcon.vue'
import SearchDropdown from './SearchDropdown.vue'

const props = defineProps({
  modelValue: Array
})

const emit = defineEmits(['update:modelValue'])

const date = ref(props.modelValue)
const { t } = useI18n()
const selectedPresetKey = ref(null)
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

  // detect if the selected range matches one of the presets
  const matchedPreset = presetMenuOptions.find(p => {
    const [start, end] = p.getRange()
    return (
      modelData &&
      modelData[0]?.toDateString() === start.toDateString() &&
      modelData[1]?.toDateString() === end.toDateString()
    )
  })

  if (matchedPreset) {
    selectedPresetKey.value = matchedPreset.key
    selectedPresetName.value = matchedPreset.name
  } else {
    selectedPresetKey.value = null
    selectedPresetName.value = modelData ? t('dash.customRangeText') : t('dash.fullRangeText')
  }

  emit('update:modelValue', date.value)
}

function applyPreset(key) {
  const preset = presetMenuOptions.find(p => p.key === key)
  if (!preset) return
  const range = preset.getRange()
  handleDateChange(range)
  selectedPresetKey.value = key
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

    <SearchDropdown
      :items="presetMenuOptions"
      v-model="selectedPresetKey"
      label-key="name"
      value-key="key"
      placeholder="Select range"
      :icon-indent="16"
      :dropdown-height="30.5"
      variant="inline"
      @update:modelValue="applyPreset"
      style="font-size: 10px; max-width: 140px;"
    />
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

.input-slot-image {
  margin-left: 12px;
  color: var(--color-text);
}

/* root settings for datepicker only */
:root {
  --dp-border-radius: 4px 0 0 4px;
  --dp-font-family: 'Noto sans JP';
  --dp-font-size: 11px;
  --dp-min-width: 800px;
}

.dp__theme_light {
  --dp-background-color: var(--color-menu-background);
  --dp-text-color: var(--color-text-color);
  --dp-primary-color: var(--color-highlight);
  --dp-hover-color: #f3f3f3;
  --dp-hover-text-color: #212121;
  --dp-disabled-color: var(--vt-c-pink);
  --dp-border-color: var(--color-subtext);
  --dp-range-between-dates-background-color: var(--color-shadow);
  --dp-range-between-dates-text-color: var(--text-color);
  --dp-range-between-border-color: none;
}
</style>