<script setup>
import { ref, computed } from 'vue'
import BaseInput from './BaseInput.vue'
import { motion, AnimatePresence } from 'motion-v'
import { useI18n } from 'vue-i18n'
import SvgIcon from '../svg-icon/SvgIcon.vue'

const props = defineProps({
  modelValue: String,
  items: { type: Array, default: () => [] }, // expects array of strings
  placeholder: { type: String, default: '' },
  variant: {
    type: String,
    default: 'standalone',
    validator: (v) => ['inline', 'standalone'].includes(v)
  }
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const isFocused = ref(false)

// v-model relay
const query = computed({
  get: () => props.modelValue || '',
  set: (val) => emit('update:modelValue', val)
})

const filteredItems = computed(() => {
  const q = (query.value || '').toLowerCase().trim()
  if (!q) return []
  return props.items
    .filter((i) => typeof i === 'string' && i.toLowerCase().includes(q))
})

// Only open when focused and there's a non-empty (trimmed) query
const menuOpen = computed(() => isFocused.value && !!(query.value || '').trim())

const selectItem = (item) => {
  emit('update:modelValue', item)
  isFocused.value = false
}

// Minimal keyboard support: Enter selects first suggestion; Esc closes
const onKeydown = (e) => {
  if (!menuOpen.value) return
  if (e.key === 'Enter') {
    const first = filteredItems.value[0]
    if (first) selectItem(first)
  } else if (e.key === 'Escape') {
    isFocused.value = false
  }
}
</script>

<template>
  <BaseInput
    v-model="query"
    :placeholder="placeholder"
    :variant="variant"
    v-click-outside="() => (isFocused = false)"
    @focus="isFocused = true"
    @blur="isFocused = false"
    @keydown="onKeydown"
  >
    <template #icon>
      <SvgIcon
        v-if="!query"
        class="search-icon"
        name="search-icon"
        width="24px"
        height="24px"
      />
    </template>

    <template #dropdown>
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
            v-for="listItem in filteredItems"
            :key="listItem"
            class="search-item"
            role="option"
            layout
            :while-hover="{ backgroundColor: 'var(--color-shadow)', paddingLeft: '24px' }"
            @mousedown.prevent="selectItem(listItem)"
          >
            <p>{{ listItem }}</p>
          </motion.div>

          <div class="search-item no-results" v-if="!filteredItems.length && (query || '').trim()">
            <p>{{ t('dash.noResultsFoundText') }}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </template>
  </BaseInput>
</template>