<script setup>
import { useI18n } from 'vue-i18n';
import { capitalizeWords } from '@/utils/capitalizeWords';

const { t } = useI18n()

const props = defineProps({
  source: { type: String, required: true }
})
</script>

<template>
<span class="ticket-source-indicator" :class="'source-' + props.source.toLowerCase()">
  {{ t('ticket.source' + capitalizeWords(props.source) + 'Text') }}
</span>
</template>

<style scoped>
.ticket-source-indicator {
  display: inline-flex;
  width: 92px;
  height: 20px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  user-select: none;
}

.source-web {
  background-color: var(--color-tile-web-back);
  color: var(--color-tile-web-contrast);
}
.source-phone {
  background-color: var(--color-tile-phone-back);
  color: var(--color-tile-phone-contrast);
}
.source-mail {
  background-color: var(--color-tile-mail-back);
  color: var(--color-tile-mail-contrast);
}
</style>