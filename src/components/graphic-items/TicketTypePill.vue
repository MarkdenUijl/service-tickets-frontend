<script setup>
import { useI18n } from 'vue-i18n';
import { capitalizeWords } from '@/utils/capitalizeWords';

const { t } = useI18n()

const props = defineProps({
  type: { type: String, required: true }
})
</script>

<template>
<span class="ticket-type-indicator" :class="'type-' + type.toLowerCase()">
  {{ t('ticket.type' + capitalizeWords(type) + 'Text') }}
</span>
</template>

<style scoped>
.ticket-type-indicator {
  display: inline-flex;
  width: 92px;
  height: 20px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 11px;
  color: var(--vt-c-white);
  user-select: none;
}

.type-hardware {
  background-color: var(--color-highlight);
}
.type-software {
  background-color: var(--color-first-complementary);
}
.type-question {
  background-color: var(--color-second-complementary);
}
.type-change {
  background-color: var(--color-third-complementary);
}
.type-unknown {
  background-color: var(--color-secondary);
}
</style>