<script setup>
import { ref, computed } from 'vue'
import { motion } from 'motion-v'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  id: { type: String, default: null },
  rows: { type: [Number, String], default: 5 },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  name: { type: String, default: null }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input'])

const isFocused = ref(false)
// lightweight unique id when none is passed
const internalId = computed(() => props.id || `ta-${Math.random().toString(36).slice(2, 9)}`)
const isFilled = computed(() => isFocused.value || (props.modelValue?.trim()?.length > 0))

function onFocus(e) {
  isFocused.value = true
  emit('focus', e)
}
function onBlur(e) {
  isFocused.value = false
  emit('blur', e)
}
function onInput(e) {
  emit('update:modelValue', e.target.value)
  emit('input', e)
}
</script>

<template>
  <div class="textarea-field">
    <motion.label
      class="textarea-placeholder"
      :for="internalId"
      :animate="{
        top: isFilled ? -13 : 12,
        left: isFilled ? 10 : 16,
        fontSize: isFilled ? '12px' : '16px',
        color: isFocused ? 'var(--color-text)' : 'var(--color-subtext)'
      }"
      :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
    >
      {{ label }}
    </motion.label>

    <textarea
      :id="internalId"
      class="text-area-styled"
      :rows="rows"
      :required="required"
      :disabled="disabled"
      :name="name"
      :value="modelValue"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.textarea-field {
  position: relative;
  width: 100%;
  display: flex;
  flex: 1;
  font-family: 'Ubuntu', sans-serif;
}
.text-area-styled {
  width: 100%;
  min-height: 120px;
  border: 1px solid var(--color-subtext);
  background-color: var(--color-menu-background);
  color: var(--color-subtext);
  border-radius: 4px;
  padding: 16px;
  font-size: 16px;
  font-family: 'Ubuntu', sans-serif;
  outline: none;
  resize: none;
}
.text-area-styled:focus {
  border-color: var(--color-text);
  color: var(--color-text);
}
.textarea-placeholder {
  pointer-events: none;
  position: absolute;
  padding: 3px;
  z-index: 1;
  color: var(--color-subtext);
  background-color: var(--color-menu-background);
  left: 16px;
  top: 16px;
  font-size: 16px;
}
</style>