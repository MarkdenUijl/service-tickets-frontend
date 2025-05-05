<script setup>
    import { ref, watchEffect } from 'vue'
    const props = defineProps({
  name: { type: String, required: true },
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' }
})

const svgContent = ref(null)

watchEffect(async () => {
  if (props.name) {
    try {
        const rawSvg = await import(`@/assets/svg/${props.name}.svg?raw`);
        let svg = rawSvg.default;

        svg = svg.replace(/<svg([^>]*)(\swidth="[^"]*")/i, '<svg$1');
        svg = svg.replace(/<svg([^>]*)(\sheight="[^"]*")/i, '<svg$1');
        svg = svg.replace(/preserveAspectRatio="[^"]*"/i, '');
        svg = svg.replace(/<svg([^>]*)>/i, '<svg$1 preserveAspectRatio="none">');

        if (!/viewBox="[^"]*"/i.test(svg)) {
          svg = svg.replace(/<svg([^>]*)>/i, '<svg$1 viewBox="0 0 100 100">')
        }

        svgContent.value = svg
    } catch (e) {
      console.error(`Could not load SVG "${props.name}"`, e);
      svgContent.value = null
    }
  }
})
</script>

<template>
    <div
      class="svg-icon"
      v-if="svgContent"
      v-html="svgContent"
      :style="{ width, height }"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    ></div>
</template>

<style scoped>
  .svg-icon svg {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>