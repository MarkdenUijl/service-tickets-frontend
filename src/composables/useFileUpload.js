// src/composables/useFileUpload.js
import { ref } from 'vue'

/**
 * Handles drag-and-drop + manual file upload logic.
 * WHY: Keeps file handling consistent and reusable across views.
 */
export function useFileUpload(maxSizeMB = 8) {
  const selectedFiles = ref([])
  const isDragging = ref(false)
  const MAX_SIZE = maxSizeMB * 1024 * 1024

  function validateFiles(files) {
    const valid = []
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        alert(`File \"${file.name}\" exceeds the ${maxSizeMB}MB limit and will be skipped.`)
        continue
      }
      valid.push(file)
    }
    return valid
  }

  function handleDrop(event) {
    event.preventDefault()
    isDragging.value = false

    const validFiles = validateFiles(Array.from(event.dataTransfer.files))
    selectedFiles.value.push(...validFiles)
  }

  function handleDragOver(event) {
    event.preventDefault()
    isDragging.value = true
  }

  function handleDragLeave() {
    isDragging.value = false
  }

  function onFileSelected(event) {
    const validFiles = validateFiles(Array.from(event.target.files))
    selectedFiles.value.push(...validFiles)
  }

  function removeFile(index) {
    selectedFiles.value.splice(index, 1)
  }

  return {
    selectedFiles,
    isDragging,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    onFileSelected,
    removeFile
  }
}