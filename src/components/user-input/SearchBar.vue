<script setup>
import { computed, ref } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { useI18n } from 'vue-i18n'
import SvgIcon from '../svg-icon/SvgIcon.vue'

const props = defineProps({ 
  modelValue: String,
  placeholder: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'standalone',
    validator: (v) => ['inline', 'standalone'].includes(v) // Inline for connected look, Standalone to separate from background
  }
})
const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const isFocused = ref(false)

const variantClass = computed(() => `search-bar-container--${props.variant}`)

// v-model proxy
const input = computed({
  get: () => props.modelValue || '',
  set: (val) => emit('update:modelValue', val)
})

// More realistic demo data for your service-ticket domain
// const demoItems = [
//   'Lighting commissioning - Building A',
//   'Emergency callout - Plant room',
//   'Fault diagnostics - Floor 3',
//   'Sensor calibration - West wing',
//   'DALI loop check - Warehouse',
//   'As-built update - Atrium',
//   'Driver replacement - Block C',
//   'Energy audit - HQ campus',
//   'Scene programming - Auditorium',
//   'Warranty ticket - Panel LCP-12'
// ]

// Computed list to avoid recreating a function each render
const filteredList = computed(() => {
  const q = (input.value || '').toLowerCase().trim()
  if (!q) return []
  return demoItems.filter((item) => item.toLowerCase().includes(q))
})

const menuOpen = computed(() => !!input.value && isFocused.value)

// Fix: use mousedown to select before the input blurs (blur happens before click)
const selectItem = (item) => {
  input.value = item
  // Close the list after selection
  isFocused.value = false
}
</script>

<template>
  <div
    class="search-bar-container"
    :class="variantClass"
    v-click-outside="() => ( isFocused = false )"
  >
    <input
      class="search-bar"
      name="search-bar"
      type="search"
      v-model="input"
      :placeholder="props.placeholder"
      autocomplete="off"
      role="combobox"
      :aria-expanded="menuOpen ? 'true' : 'false'"
      aria-autocomplete="list"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />

    <SvgIcon
      v-if="!input"
      class="search-icon"
      name="search-icon"
      width="24px"
      height="24px"
    />

    <AnimatePresence>
      <motion.div
        v-if="menuOpen"
        class="search-results"
        role="listbox"
        layout
        :initial="{ opacity: 0, height: 0, transformOrigin: 'top' }"
        :animate="{ opacity: 1, height: 'auto', transformOrigin: 'top' }"
        :exit="{ opacity: 0, height: 0, transformOrigin: 'top' }"
        :transition="{ type: 'spring', stiffness: 200, damping: 26 }"
      >
        <motion.div
          v-for="listItem in filteredList"
          :key="listItem"
          class="search-item"
          role="option"
          layout
          :while-hover="{ backgroundColor: 'var(--color-shadow)', paddingLeft: '24px' }"
          @mousedown.prevent="selectItem(listItem)"
        >
          <p>{{ listItem }}</p>
        </motion.div>

        <div class="search-item no-results" v-if="!filteredList.length">
          <p>{{ t('dash.noResultsFoundText') }}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
.search-bar-container {
  width: 100%;
  position: relative;
}

.search-bar-container {
  --sb-radius: 4px;
  --sb-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  --sb-border: none;
}

.search-bar-container--standalone {
  --sb-radius: 4px;
  --sb-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  --sb-border: none;
}

.search-bar-container--inline {
  --sb-radius: 0 4px 4px 0;
  --sb-shadow: none;
  --sb-border: var(--color-subtext) 1px solid;
}

.search-bar {
  font-family: 'Ubuntu', sans-serif;
  background-color: var(--color-menu-background);
  border: none;
  color: var(--color-text);
  width: 100%;
  border-radius: var(--sb-radius);
  box-shadow: var(--sb-shadow);
  border: var(--sb-border);
  outline: none;
  /* border-radius: 4px; */
  /* box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25); */
  padding: 0 48px;
  height: 40px;
  font-size: 16px;
}

.search-icon {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  left: 16px;
  color: var(--color-subtext);
}

.search-bar::placeholder {
  color: var(--color-subtext);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--color-menu-background);
  border-radius: 4px;
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.25);
  margin-top: 4px;
  z-index: 100;
  overflow: scroll;
  max-height: 200px;
}

.search-results::-webkit-scrollbar {
  display: none;
}

.search-item {
  padding: 12px 16px;
  cursor: pointer;
  color: var(--color-text);
}

.no-results {
  color: var(--color-subtext);
  font-style: italic;
}
</style>