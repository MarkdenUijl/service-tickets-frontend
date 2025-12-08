<script setup>
import { motion } from 'motion-v'

const props = defineProps({
  loading: { type: Boolean, default: false },
  label: { type: String, required: true },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  variant: { type: String, default: 'solid' }
})
</script>

<template>
  <motion.button
    :type="props.type"
    :disabled="props.loading || props.disabled"
    :class="['loader-button', `loader-button--${props.variant}`]"
    :whilePress="{ scale: 0.95 }"
  >
    <template v-if="!props.loading">
      {{ props.label }}
    </template>

    <template v-else>
      <motion.div
        class="spinner"
        :animate="{ rotate: 360 }"
        :transition="{ repeat: Infinity, ease: 'linear', duration: 1 }"
      />
    </template>
  </motion.button>
</template>

<style scoped>
.loader-button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 200px;
  height: 44px;

  border: none;
  border-radius: 8px;

  font-weight: bold;

  cursor: pointer;
  position: relative;
  overflow: hidden;


  border: 1px solid transparent;
  transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.15s ease;
}

.loader-button--solid {
  background-color: var(--color-highlight);
  color: white;
}

.loader-button--outline {
  background-color: transparent;
  color: var(--color-text);
  border-color: var(--color-text);
}

.loader-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.spinner {
  width: 18px;
  height: 18px;

  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
}
</style>