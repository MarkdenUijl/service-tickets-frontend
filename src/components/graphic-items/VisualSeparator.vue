<script setup>
  const props = defineProps({
    separatorText: { type: String },
    orientation: { 
      type: String,
      default: 'horizontal',
      validator: (v) => ['horizontal', 'vertical'].includes(v) 
    }
  })
</script>

<template>
  <div class="separator" :class="props.orientation">
    <template v-if="props.separatorText">
      <span class="separator-line"></span>
      <span class="separator-text">{{ props.separatorText }}</span>
      <span class="separator-line"></span>
    </template>
    <template v-else>
      <span class="separator-line full"></span>
    </template>
  </div>
</template>

<style scoped>
.separator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.horizontal {
  flex-direction: row;
  width: 100%;
}

.vertical {
  flex-direction: column;
  height: 100%;
}

.separator-line {
  flex-grow: 1;
  background-color: var(--color-subtext);
}

.horizontal .separator-line {
  height: 1px;
}

.vertical .separator-line {
  width: 1px;
}

.separator-text {
  color: var(--color-subtext);
  margin: 0 0.5rem;
  white-space: nowrap;
  user-select: none;
}

.separator-line.full {
  flex-grow: 1;
}
</style>