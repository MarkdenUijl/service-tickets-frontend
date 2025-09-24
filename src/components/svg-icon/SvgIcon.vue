<script setup>
import { defineAsyncComponent, computed } from 'vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'

const props = defineProps({
  name: { type: String, required: true },
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' },
  radius: { type: String, default: '0' }
})

// Async load the requested SVG by name, with a loading fallback
const SvgComponent = computed(() =>
  defineAsyncComponent({
    loader: () => import(`@/assets/svg/${props.name}.svg`),
    loadingComponent: LoadingSpinner,
    delay: 200
  })
)
</script>

<template>
  <div
    class="svg-icon-container"
    :style="{ width: props.width, height: props.height, borderRadius: props.radius }"
  >
    <component :is="SvgComponent" width="100%" height="100%" />
  </div>
</template>

<style scoped>
.svg-icon-container {
  overflow: hidden;
  display: inline-flex; /* ensures SVGs align well inline */
}
</style>