<script setup>
    import { ref, computed, watch } from 'vue';
    import TextInput from './TextInput.vue';
    import { motion } from 'motion-v';

    const props = defineProps({
        placeholder: String,
        type: String,
        validationText: String,
        isValid: {
            type: Boolean,
            default: true,
        }
    });

    const modelValue = defineModel();
    const touched = ref(false);

    const handleBlur = () => {
        if(modelValue.value !== '') {
            touched.value = true;
        }
    }

    const shouldValidate = computed(() => {
        return !props.isValid &&
                props.validationText &&
                modelValue.value !== '' &&
                touched.value
    });
    
    watch(modelValue, (newValue) => {
        if(newValue === '') {
            touched.value = false;
        }
    });
    
    const validationColor = computed(() => (shouldValidate.value ? 'var(--vt-c-red)' : null));
</script>

<template>
    <div class="input-wrapper">
        <TextInput
            v-model="modelValue"
            :placeholder="props.placeholder"
            :type="props.type"
            :validationColor="validationColor"
            @blur="handleBlur"
        />
        
        <motion.span 
            v-if="shouldValidate"
            class="validation-text"
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

    VALUE: {{ modelValue }}
</template>
  
<style scoped>
    .input-wrapper {
        position: relative;
        width: min-content;
    }

    .validation-text {
        position: absolute;
        bottom: -26px;
        right: 0;
        z-index: 2;
        font-size: 14px;
        color: var(--vt-c-red);
        pointer-events: none;
    }
</style>