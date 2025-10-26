<script setup>
import { ref, watch, computed } from 'vue'
import { motion } from 'motion-v'
import countryCodesData from '@/data/countryCodes.json'

const countryCodes = computed(() =>
  Object.entries(countryCodesData).map(([key, data]) => ({
    code: key,
    name: data.name,
    dial_code: data.phone?.[0] || '',
    flag: data.emoji,
    image: data.image
  }))
)

const props = defineProps({
  countryCode: { type: String, default: '+31' },
  placeholder: { type: String, default: '123 456 789' },
  validationColor: { type: String, required: false },
  isValid: Boolean
})

const emit = defineEmits(['update:countryCode', 'blur'])

const localCode = ref(props.countryCode)
// const localValue = ref(props.modelValue || '')
const modelValue = defineModel()

const isFocussed = ref(false)

const handleFocus = () => {
  isFocussed.value = true
}

const handleBlur = () => {
  isFocussed.value = false
  emit('blur')
}

const hasValue = computed(() => {
  const v = modelValue.value
  return v !== null && v !== undefined && String(v).length > 0
})

const isFilled = computed(() => isFocussed.value || hasValue.value)

const inputColor = computed(() =>
  props.validationColor || (isFocussed.value ? 'var(--color-text)' : 'var(--color-subtext)')
)

watch(localCode, (val) => emit('update:countryCode', val))
// watch(localValue, (val) => emit('update:modelValue', val))
</script>

<template>
  <div 
    class="phone-input-wrapper"
    :class="{ focussed: isFocussed }"
    :style="{ borderColor: inputColor }"
  >
    <select 
      v-model="localCode" 
      class="country-select"
      :style="{ color: inputColor }"
    >
      <option v-for="c in countryCodes" 
        :key="c.code" 
        :value="c.dial_code"
      >
        {{ c.name }} ({{ c.dial_code }})
      </option>
    </select>

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
        v-model="modelValue"
        :class="{ focussed: isFocussed }"
        type="tel"
        class="phone-input"
        v-on:keyup="modelValue = modelValue.replace(/[^0-9-]/g, '')"
        :style="{ borderColor: inputColor, color: inputColor }"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>
  </div>
</template>

<style scoped>
.phone-input-wrapper {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 60px;
  border: 1px var(--color-subtext) solid;
  border-radius: 4px;
  gap: 4px;
}

.phone-input-wrapper.focussed {
  border-color: var(--color-text);
}

.country-select {
  border: none;
  border-radius: 4px;
  font-size: 16px;
  background-color: var(--color-menu-background);
  color: var(--color-subtext);
  padding: 8px;
  font-family: 'Ubuntu';
  outline: none;
  max-width: 180px;
}

.input-field {
  font-family: 'Ubuntu', sans-serif;
  width: 100%;
  height: 100%;
  position: relative;
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

.phone-input {
  outline: none;
  position: absolute;
  border: none;
  left: 0;
  width: 90%;
  height: 100%;
  flex-shrink: 0;
  padding-left: 16px;
  background-color: var(--color-menu-background);
  color: var(--color-subtext);
  z-index: 0;
  font-size: 16px;
}

.phone-input:-webkit-autofill {
  box-shadow: 0 0 0px 1000px var(--color-menu-background) inset !important;
  -webkit-text-fill-color: var(--color-subtext) !important;
  caret-color: var(--color-subtext);
}

.phone-input.focussed:-webkit-autofill {
  -webkit-text-fill-color: var(--color-text) !important;
  caret-color: var(--color-text);
}
</style>