<script setup>
defineProps({
  /**
   * The label text shown on the left side (key)
   */
  label: {
    type: String,
    required: true
  },
  /**
   * The actual value shown on the right side
   */
  value: {
    type: [String, Number],
    default: ''
  },
  /**
   * Optional CSS class for styling the value
   * (e.g. 'valid' or 'expired')
   */
  valueClass: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="ticket-info-line">
    <span class="info-line-key">{{ label }}</span>
    <span class="info-line-value" :class="valueClass">{{ value }}</span>
  </div>
</template>

<style scoped>
.ticket-info-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 12px;
}

.info-line-key {
  font-weight: 700;
  color: var(--color-subtext);
}

.info-line-value {
  font-weight: 500;
}

.info-line-value.valid {
  color: var(--vt-c-green);
}

.info-line-value.expired {
  color: var(--vt-c-red);
}
</style>