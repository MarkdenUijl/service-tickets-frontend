<script setup>
import { defineAsyncComponent, computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' },
  radius: { type: String, default: '0' }
})

const SvgComponent = computed(() =>
  defineAsyncComponent(() => import(`@/assets/svg/${props.name}.svg`))
)
</script>

<template>
  <div class="svg-icon-container" :style="{ width: props.width, height: props.height, borderRadius: props.radius }">
    <component :is="SvgComponent" width="100%" height="100%" />
  </div>
</template>

<style scoped>
  .svg-icon-container {
    overflow: hidden;
  }
</style>