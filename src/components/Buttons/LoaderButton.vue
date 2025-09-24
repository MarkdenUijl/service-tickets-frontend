<script setup>
import { motion } from 'motion-v'

const props = defineProps({
  loading: { type: Boolean, default: false },
  label: { type: String, required: true },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false }
})
</script>

<template>
  <motion.button
    :type="props.type"
    :disabled="props.loading || props.disabled"
    class="loader-button"
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

  background-color: var(--color-highlight);
  color: white;
  font-weight: bold;

  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.spinner {
  width: 18px;
  height: 18px;

  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
}
</style>