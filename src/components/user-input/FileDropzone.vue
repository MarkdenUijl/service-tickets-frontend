<script setup>
import { ref, watch, watchEffect } from 'vue'
import { useFileUpload } from '@/composables/useFileUpload'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },   // Array<File>
  maxFiles:   { type: Number, default: 8 },
  placeholder:{ type: String, default: 'Click here or drag files to upload' },
  accept:     { type: String, default: '' },        // e.g. "image/*,.pdf"
  showList:   { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'change', 'remove'])

const {
  selectedFiles,
  isDragging,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  onFileSelected,
  removeFile
} = useFileUpload(props.maxFiles)

const fileInput = ref(null)

// Keep internal state in sync with parent when parent updates it externally
watch(
  () => props.modelValue,
  (newValue) => {
    // only replace if the reference or length changed to prevent loops
    if (newValue !== selectedFiles.value) {
      selectedFiles.value = newValue.slice()
    }
  },
  { deep: true }
)

// When internal changes occur, emit them upward
function updateParent() {
  emit('update:modelValue', selectedFiles.value)
  emit('change', selectedFiles.value)
}

function openPicker() {
  fileInput.value?.click()
}

function onInputChange(e) {
  onFileSelected(e)
  updateParent()
}

function onDrop(e) {
  handleDrop(e)
  updateParent()
}

function removeAt(index) {
  removeFile(index)
  updateParent()
  emit('remove', index)
}
</script>

<template>
  <div class="file-upload-field">
    <ul class="file-list">
      <li v-for="(file, index) in selectedFiles" :key="index" class="file-item">
        <span class="file-name">{{ file.name }}</span>
        <button type="button" class="remove-file-btn" @click.stop="removeAt(index)">x</button>
      </li>
    </ul>
    
    <div
      class="file-dropzone"
      :class="{ dragging: isDragging }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop="onDrop"
      @click="openPicker"
    >
      <p>{{ placeholder }}</p>
      <input
        ref="fileInput"
        type="file"
        class="hidden-file-input"
        multiple
        :accept="accept"
        @change="onInputChange"
      />
    </div>
  </div>
</template>

<style scoped>
.file-upload-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-dropzone {
  border: 2px dashed var(--color-subtext);
  border-radius: 6px;
  padding: 24px;
  text-align: center;
  background-color: var(--color-menu-background);
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s, color 0.3s;
  color: var(--color-subtext);
  font-size: 14px;
}

.file-dropzone.dragging {
  border-color: var(--color-highlight);
  background-color: var(--color-secondary);
  color: var(--color-highlight);
}

.hidden-file-input {
  display: none;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 60px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-secondary);
  height: 24px;
  border-radius: 12px;
  padding: 0 12px;
  font-size: 10px;
  color: var(--color-highlight);
  width: 140px;
}

.file-name {
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-file-btn {
  color: var(--color-highlight);
  cursor: pointer;
  font-size: 12px;
}
</style>