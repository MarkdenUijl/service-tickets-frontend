<script setup>
import { AnimatePresence, motion } from 'motion-v'
import { useI18n } from 'vue-i18n'
import { capitalizeWords } from '@/utils/capitalizeWords'

const props = defineProps({
  // v-model:isOpen
  isOpen: {
    type: Boolean,
    default: false
  },
  // Array of { id, title, isOpen, options, model }
  sections: {
    type: Array,
    required: true
  },
  /**
   * Namespace for translation keys, e.g. "ticket"
   * Used as: `${namespace}.column${capitalizeWords(section.title)}Text`
   * and `${namespace}.${section.title.toLowerCase()}${capitalizeWords(option)}Text`
   */
  namespace: {
    type: String,
    default: 'ticket'
  }
})

const emit = defineEmits(['update:isOpen'])

const { t } = useI18n()

function toggleFilterSection(section) {
  // mutating nested object on props is fine for this use case
  section.isOpen = !section.isOpen
}

function onClickOutside() {
  if (!props.isOpen) return
  emit('update:isOpen', false)
}
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="isOpen"
      class="filter-popout"
      v-click-outside="onClickOutside"
      role="region"
      :initial="{ opacity: 0, y: -16 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: -16 }"
      :transition="{ type: 'spring', stiffness: 300, damping: 24 }"
    >
      <div
        v-for="section in sections"
        :key="section.id"
        class="filter-section"
      >
        <div
          class="filter-section-header"
          :class="{ open: section.isOpen }"
          @click="toggleFilterSection(section)"
        >
          {{ t(`${namespace}.column${capitalizeWords(section.title)}Text`) }}
        </div>

        <AnimatePresence>
          <motion.div
            v-if="section.isOpen"
            class="filter-section-content"
            :id="`filter-section-${section.id}-content`"
            :initial="{ opacity: 0.3, maxHeight: 0 }"
            :animate="{ opacity: 1, maxHeight: 300 }"
            :exit="{ opacity: 0.3, maxHeight: 0 }"
            :transition="{ type: 'spring', stiffness: 100, damping: 16, bounce: 0.1 }"
            style="overflow: hidden;"
          >
            <label
              v-for="option in section.options"
              :key="option"
              class="filter-checkbox-label"
            >
              <input
                type="checkbox"
                :value="option"
                v-model="section.model"
              />
              {{ t(
                `${namespace}.${section.title.toLowerCase()}${capitalizeWords(option)}Text`
              ) }}
            </label>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  </AnimatePresence>
</template>

<style scoped>

/* Filter Popout Styles */
.filter-popout {
  position: absolute;
  z-index: 20;
  background-color: var(--color-menu-background);
  border: 1px solid var(--color-subtext);
  border-radius: 4px;
  padding: 16px;
  width: 320px;
  top: 44px;
  box-shadow: 0 4px 12px var(--color-shadow);
  font-weight: 600;
  color: var(--color-text);
  user-select: none;
}

.filter-section {
  max-width: 75%;
  padding-left: 16px;
}

.filter-section-header {
  font-weight: 700;
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.filter-section-header.open {
  background-color: var(--color-highlight);
  color: var(--vt-c-white);
}

.filter-section-content {
  display: flex;
  flex-direction: column;
  padding-left: 8px;
}

.filter-checkbox-label {
  display: flex;
  align-items: center;
  border-left: 2px var(--color-text) solid;
  gap: 6px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 16px;
}

.filter-checkbox-label:hover {
  border-left: 4px var(--color-highlight) solid;
}


/* Custom checkbox styling for filter checkboxes (matches LoginForm.vue) */
.filter-checkbox-label input[type='checkbox'] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  height: 14px;
  width: 14px;
  border: 1px solid var(--color-subtext);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

.filter-checkbox-label input[type='checkbox']:checked {
  background-color: var(--color-highlight);
  border: var(--color-highlight);
}

.filter-checkbox-label input[type='checkbox']:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 6px;
  height: 10px;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
  border-color: white;
  border-style: solid;
}
</style>