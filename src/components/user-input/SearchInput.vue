<script setup>
import { computed } from 'vue'
import BaseInput from './BaseInput.vue'
import SvgIcon from '../svg-icon/SvgIcon.vue'

// Props kept minimal for flexibility
const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: '' },
  variant: {
    type: String,
    default: 'standalone',
    validator: (v) => ['inline', 'standalone'].includes(v)
  }
})

const emit = defineEmits(['update:modelValue'])

// v-model proxy — ensures proper binding & updates
const inputValue = computed({
  get: () => props.modelValue ?? '',
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <BaseInput
    v-model="inputValue"
    :placeholder="placeholder"
    :variant="variant"
  >
    <!-- Leading icon slot (visible only when empty) -->
    <template #icon>
      <SvgIcon
        v-if="!inputValue"
        class="search-icon"
        name="search-icon"
        width="24px"
        height="24px"
      />
    </template>
  </BaseInput>
</template>