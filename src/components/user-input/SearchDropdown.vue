<script setup>
import BaseInput from './BaseInput.vue'
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'

// Props: configure label/value keys, variant, icon indent, and dropdown height
const props = defineProps({
  items: { type: Array, default: () => [] },
  modelValue: [String, Number, Object],
  placeholder: String,
  variant: {
    type: String,
    default: 'standalone',
    validator: (v) => ['inline', 'standalone'].includes(v)
  },
  labelKey: { type: String, default: 'name' },  // what to display
  valueKey: { type: String, default: 'id' },    // what to emit
  iconIndent: { type: Number, default: 48 },
  dropdownHeight: { type: Number, default: 40 }
})

const emit = defineEmits(['update:modelValue'])

// Dropdown open state
const isOpen = ref(false)

// Compute visible label based on current modelValue
const selectedLabel = computed(() => {
  const match = props.items.find(i => i[props.valueKey] === props.modelValue)
  return match ? match[props.labelKey] : ''
})

// Update selected item and close dropdown
function selectItem(item) {
  emit('update:modelValue', item[props.valueKey])
  isOpen.value = false
}

// Compute inline style vars for spacing and height
const cssVars = computed(() => ({
  '--sb-padding-left': `${props.iconIndent}px`,
  '--sb-height': `${props.dropdownHeight}px`
}))
</script>

<template>
  <BaseInput
    :model-value="selectedLabel"
    :placeholder="placeholder"
    :read-only="true"
    :variant="variant"
    v-click-outside="() => (isOpen = false)"
    @focus="isOpen = true"
    @blur="isOpen = false"
    :style="cssVars"
  >
    <!-- Dropdown rendered in BaseInput slot -->
    <template #dropdown>
      <AnimatePresence>
        <motion.div
          v-if="isOpen"
          class="search-results"
          role="listbox"
          layout
          :initial="{ opacity: 0, height: 0, transformOrigin: 'top' }"
          :animate="{ opacity: 1, height: 'auto', transformOrigin: 'top' }"
          :exit="{ opacity: 0, height: 0, transformOrigin: 'top' }"
          :transition="{ type: 'spring', stiffness: 200, damping: 26 }"
        >
          <!-- Render each selectable item -->
          <motion.div
            v-for="item in items"
            :key="item[valueKey]"
            class="search-item"
            layout
            role="option"
            tabindex="0"
            :while-hover="{ backgroundColor: 'var(--color-shadow)', paddingLeft: '24px' }"
            @mousedown.prevent="selectItem(item)"
          >
            <p>{{ item[labelKey] }}</p>
          </motion.div>

          <!-- No results fallback -->
          <div v-if="!items.length" class="search-item no-results">
            <p>No items found</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </template>
  </BaseInput>
</template>