<script setup>
import { useI18n } from 'vue-i18n';
import { capitalizeWords } from '@/utils/capitalizeWords';

const { t } = useI18n()

const props = defineProps({
  priority: { type: String, required: true }
})
</script>

<template>
<span class="ticket-priority-indicator" :class="'priority-' + props.priority.toLowerCase()">
  {{ t('ticket.priority' + capitalizeWords(props.priority) + 'Text') }}
</span>
</template>

<style scoped>
.ticket-priority-indicator {
  display: inline-flex;
  width: 92px;
  height: 20px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  user-select: none;
}

.priority-low {
  background-color: var(--color-tile-priority-low-back);
  color: var(--color-tile-priority-low-contrast);
}
.priority-medium {
  background-color: var(--color-tile-priority-medium-back);
  color: var(--color-tile-priority-medium-contrast);
}
.priority-high {
  background-color: var(--color-tile-priority-high-back);
  color: var(--color-tile-priority-high-contrast);
}
.priority-critical {
  background-color: var(--color-tile-priority-critical-back);
  color: var(--color-tile-priority-critical-contrast);
}
</style>