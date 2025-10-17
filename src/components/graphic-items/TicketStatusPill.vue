<script setup>
import { useI18n } from 'vue-i18n';
import { capitalizeWords } from '@/utils/capitalizeWords';

const { t } = useI18n()

const props = defineProps({
  status: { type: String, required: true }
})
</script>

<template>
<span class="ticket-status-indicator" :class="'status-' + props.status.toLowerCase()">
  {{ t('ticket.status' + capitalizeWords(props.status) + 'Text') }}
</span>
</template>

<style scoped>
.ticket-status-indicator {
  display: inline-flex;
  width: 92px;
  height: 20px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  user-select: none;
}

.status-open {
  background-color: var(--color-tile-mild-back);
  color: var(--color-tile-mild-contrast);
}
.status-closed {
  background-color: var(--color-tile-great-back);
  color: var(--color-tile-great-contrast);
}
.status-pending {
  background-color: var(--color-tile-medium-back);
  color: var(--color-tile-medium-contrast);
}
.status-in_progress {
  background-color: var(--color-tile-good-back);
  color: var(--color-tile-good-contrast);
}
.status-escalated {
  background-color: var(--color-tile-dire-back);
  color: var(--color-tile-dire-contrast);
}
</style>