<script setup>
import { computed } from 'vue'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  },
  filename: {
    type: String,
    required: true
  }
})

const fileExtension = computed(() => {
  const parts = props.filename.split('.')
  return parts.length > 1 ? parts.pop().toUpperCase() : ''
})
</script>

<template>
  <li class="file-item">
    <div class="file-preview">
      <span class="file-type">{{ fileExtension }}</span>
    </div>

    <div class="file-name">{{ filename }}</div>

    <button
      type="button"
      class="file-action-button"
      @click="$emit('download', id, filename)"
    >
      <SvgIcon name="icon-download" width="12px" />
    </button>

    <button
      type="button"
      class="file-action-button"
      @click="$emit('delete', id)"
    >
      <SvgIcon name="icon-delete-file" width="12px" />
    </button>
  </li>
</template>

<style scoped>
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: var(--color-soft-pink);
  border: 1px solid var(--color-highlight);
  border-radius: 6px;
  padding: 8px 12px;
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background-color: var(--vt-c-pink);
}

.file-preview {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: var(--vt-c-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--color-subtext);
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-action-button {
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
}
</style>