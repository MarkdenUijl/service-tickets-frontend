<script setup>
import { computed, useSlots } from 'vue'

// NOTE: Keep props minimal—BaseInput is a thin, reusable shell
const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  variant: {
    type: String,
    default: 'standalone',
    validator: (v) => ['inline', 'standalone'].includes(v)
  },
  hasDropdown: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

// v-model proxy
const inputValue = computed({
  get: () => props.modelValue ?? '',
  set: (val) => emit('update:modelValue', val)
})

// Detect presence of an icon slot to adjust left padding
const slots = useSlots()
const hasLeading = computed(() => !!slots.icon || props.hasDropdown)

// Expose CSS variables as a single source of truth for spacing
const cssVars = computed(() => ({
  '--sb-padding-left': hasLeading.value ? '48px' : '16px'
}))
</script>

<template>
  <div
    class="search-bar-container"
    :class="`search-bar-container--${props.variant}`"
    :style="cssVars"
  >
    <input
      class="search-bar"
      :placeholder="placeholder"
      :readonly="readOnly"
      :type="type"
      v-model="inputValue"
      autocomplete="off"
      @focus="emit('focus')"
      @blur="emit('blur')"
    />

    <!-- Slots for leading icon and trailing dropdown/button -->
    <slot name="icon" />
    <slot name="dropdown" />
  </div>
</template>

<style>
.search-bar-container {
  width: 100%;
  position: relative;

  /* Default CSS vars (overridden per-variant below) */
  --sb-radius: 4px;
  --sb-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  --sb-border: 1px solid var(--color-subtext);
  --sb-padding-left: 48px; /* may be overridden by inline/slots */
  --sb-height: 40px;
}

/* Standalone: subtle elevation, full border radius */
.search-bar-container--standalone {
  --sb-radius: 4px;
  --sb-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  --sb-border: 1px solid var(--color-subtext);
}

/* Inline: attach to a leading control (e.g., dropdown), drop left radius */
.search-bar-container--inline {
  --sb-radius: 0 4px 4px 0;
  --sb-shadow: none;
  --sb-border: 1px solid var(--color-subtext);
}

.search-bar {
  font-family: 'Ubuntu', sans-serif;
  background-color: var(--color-menu-background);
  border: var(--sb-border);
  color: var(--color-text);
  width: 100%;
  border-radius: var(--sb-radius);
  outline: none;
  padding: 0 var(--sb-padding-left);
  height: var(--sb-height);
  font-size: 16px;
}

.search-bar::placeholder {
  color: var(--color-subtext);
}

/* Leading search icon positioning (slot content uses this class) */
.search-icon {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  left: 16px;
  color: var(--color-subtext);
}

/* Shared dropdown/results styling kept here for convenience of consumers */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--color-menu-dropdown);
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
  padding: 6px 16px;
  cursor: pointer;
  color: var(--color-text);
}

.no-results {
  color: var(--color-subtext);
  font-style: italic;
}
</style>