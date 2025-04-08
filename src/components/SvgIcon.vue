<script setup>
    import { ref, watchEffect } from 'vue'
    const props = defineProps({
  name: { type: String, required: true },
  width: { type: String, default: '100px' },
  height: { type: String, default: '100px' }
})

const svgContent = ref(null)

watchEffect(async () => {
  if (props.name) {
    try {
      const rawSvg = await import(`@/assets/SVG/${props.name}.svg?raw`)
      let svg = rawSvg.default

      // Remove hardcoded width/height from the <svg> tag
      svg = svg.replace(/<svg([^>]*)(\swidth="[^"]*")/i, '<svg$1')
      svg = svg.replace(/<svg([^>]*)(\sheight="[^"]*")/i, '<svg$1')

      // Add a fallback viewBox if one isn't present (so scaling works)
      if (!/viewBox="[^"]*"/i.test(svg)) {
        svg = svg.replace(/<svg([^>]*)>/i, '<svg$1 viewBox="0 0 100 100">')
      }

      svgContent.value = svg
    } catch (e) {
      console.error(`Could not load SVG "${props.name}"`, e)
      svgContent.value = null
    }
  }
})
</script>


<template>
    <svg
      v-if="svgContent"
      v-html="svgContent"
      :style="{ width, height }"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    ></svg>
</template>
  
  