<script setup>
import { ref, computed, watch } from 'vue'
import TextInput from './TextInput.vue'
import { motion } from 'motion-v'

const props = defineProps({
  id: { type: String, required: true },
  placeholder: { type: String, required: true },
  type: { type: String, required: true },
  validationText: { type: String, default: '' },
  isValid: { type: Boolean, default: true },
  validationMode: {
    type: String,
    default: 'red-only',
    validator: (value) => ['both', 'red-only'].includes(value)
  }
})

const modelValue = defineModel()

const touched = ref(false)

const handleBlur = () => {
  if (modelValue.value !== '' && modelValue.value !== null && modelValue.value !== undefined) {
    touched.value = true
  }
}

watch(modelValue, (newValue) => {
  if (newValue === '' || newValue === null || newValue === undefined) {
    touched.value = false
  }
})

// Should we show a validation message?
const shouldValidate = computed(() => {
  return (
    !props.isValid &&
    !!props.validationText &&
    (touched.value || modelValue.value === '' || modelValue.value === null || modelValue.value === undefined)
  )
})

// Is the field valid *and* filled?
const isValidAndFilled = computed(() => {
  return props.isValid && modelValue.value !== '' && modelValue.value !== null && modelValue.value !== undefined
})

// Validation color logic (DRY and explicit)
const validationColor = computed(() => {
  if (shouldValidate.value) {
    return 'var(--vt-c-red)'
  }
  if (props.validationMode === 'both' && isValidAndFilled.value) {
    return 'var(--vt-c-green)'
  }
  return null
})
</script>

<template>
  <div class="input-wrapper">
    <TextInput
      :id="props.id"
      v-model="modelValue"
      :placeholder="props.placeholder"
      :type="props.type"
      :validationColor="validationColor"
      @blur="handleBlur"
    />

    <motion.span
      v-if="shouldValidate"
      class="validation-text"
      role="alert"
      :initial="{ opacity: 0, y: -4 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: -4 }"
      :transition="{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.5
      }"
    >
      {{ props.validationText }}
    </motion.span>
  </div>
</template>

<style scoped>
.input-wrapper {
  position: relative;
  width: 100%;
}

.validation-text {
  position: absolute;
  bottom: -18px;
  right: 0;
  z-index: 2;
  font-size: 13px;
  color: var(--color-highlight);
  pointer-events: none;
}
</style>