<script setup>
import { ref, computed } from 'vue'
import { motion } from 'motion-v'

// Props kept minimal; added optional `name` and `autocomplete` for better forms
const props = defineProps({
  id: { type: String, required: true },
  placeholder: { type: String, required: true },
  type: { type: String, required: true },
  validationColor: { type: String, required: false },
  name: { type: String, required: false },
  autocomplete: { type: String, required: false }
})

const emit = defineEmits(['blur'])

// v-model for the input value
const modelValue = defineModel()

const isFocussed = ref(false)
const passwordIsVisible = ref(false)

const handleFocus = () => {
  isFocussed.value = true
}

const handleBlur = () => {
  isFocussed.value = false
  emit('blur')
}

// Treat `null`/`undefined` as empty; do not float the label for those
const hasValue = computed(() => {
  const v = modelValue.value
  return v !== null && v !== undefined && String(v).length > 0
})

const isFilled = computed(() => isFocussed.value || hasValue.value)

const inputType = computed(() =>
  props.type !== 'password' ? props.type : passwordIsVisible.value ? 'text' : 'password'
)

const inputColor = computed(() =>
  props.validationColor || (isFocussed.value ? 'var(--color-text)' : 'var(--color-subtext)')
)

const inputName = computed(() => props.name || props.id)
const autocompleteAttr = computed(() => props.autocomplete ?? undefined)

const togglePasswordVisibility = () => {
  passwordIsVisible.value = !passwordIsVisible.value
}
</script>

<template>
  <div class="input-field">
    <motion.label
      class="input-placeholder"
      :for="props.id"
      :animate="{
        top: isFilled ? -13 : 18,
        left: isFilled ? 10 : 18,
        fontSize: isFilled ? '12px' : '16px',
        color: inputColor
      }"
      :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
    >
      {{ props.placeholder }}
    </motion.label>

    <input
      :id="props.id"
      class="text-input"
      :class="{ focussed: isFocussed }"
      :type="inputType"
      :name="inputName"
      v-model="modelValue"
      :autocomplete="autocompleteAttr"
      :style="{ borderColor: inputColor, color: inputColor }"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <button
      v-if="props.type === 'password'"
      class="visibility-toggle"
      type="button"
      @mousedown.prevent
      @click="togglePasswordVisibility"
      :aria-pressed="passwordIsVisible ? 'true' : 'false'"
      aria-label="Toggle password visibility"
    >
      <svg width="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          :d="passwordIsVisible
            ? 'M12 5C5.63636 5 2 12 2 12C2 12 5.63636 19 12 19C18.3636 19 22 12 22 12C22 12 18.3636 5 12 5Z M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
            : 'M20 14.8335C21.3082 13.3317 22 12 22 12C22 12 18.3636 5 12 5C11.6588 5 11.3254 5.02013 11 5.05822C10.6578 5.09828 10.3244 5.15822 10 5.23552M12 9C12.3506 9 12.6872 9.06015 13 9.17071C13.8524 9.47199 14.528 10.1476 14.8293 11C14.9398 11.3128 15 11.6494 15 12M3 3L21 21M12 15C11.6494 15 11.3128 14.9398 11 14.8293C10.1476 14.528 9.47198 13.8524 9.1707 13C9.11386 12.8392 9.07034 12.6721 9.04147 12.5M4.14701 9C3.83877 9.34451 3.56234 9.68241 3.31864 10C2.45286 11.1282 2 12 2 12C2 12 5.63636 19 12 19C12.3412 19 12.6746 18.9799 13 18.9418'"
          :stroke="inputColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.visibility-toggle {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  z-index: 2;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-field {
  font-family: 'Ubuntu', sans-serif;
  width: 100%;
  height: 60px;
  position: relative;
}

.text-input {
  outline: none;
  position: absolute;
  left: 0;
  width: inherit;
  height: 60px;
  flex-shrink: 0;
  background-color: var(--color-menu-background);
  border: 1px solid var(--color-subtext);
  color: var(--color-subtext);
  border-radius: 4px;
  padding-left: 16px;
  z-index: 0;
  font-size: 16px;
}

.text-input.focussed {
  color: var(--color-text);
  border: 1px solid var(--color-text);
}

.text-input:-webkit-autofill {
  box-shadow: 0 0 0px 1000px var(--color-menu-background) inset !important;
  -webkit-text-fill-color: var(--color-subtext) !important;
  caret-color: var(--color-subtext);
}

.text-input.focussed:-webkit-autofill {
  -webkit-text-fill-color: var(--color-text) !important;
  caret-color: var(--color-text);
}

.input-placeholder {
  pointer-events: none;
  position: relative;
  padding: 3px;
  z-index: 1;
  color: var(--color-subtext);
  background-color: var(--color-menu-background);
  left: 16px;
  top: 18px;
  font-size: 16px;
  width: min-content;
}
</style>