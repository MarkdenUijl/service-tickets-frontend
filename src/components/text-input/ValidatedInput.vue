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
        },
        validationMode: {
            type: String,
            default: 'red-only',
            validator: (value) => ['both', 'red-only'].includes(value),
        },
        id: {
            type: String,
            required: true
        },
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
    
    const isValidAndFilled = computed(() => {
        return props.isValid && modelValue.value !== '';
    });

    const validationColor = computed(() => {
        if (shouldValidate.value) {
            return 'var(--vt-c-red)';
        } else if (props.validationMode === 'both' && isValidAndFilled.value) {
            return 'var(--vt-c-green)';
        } else {
            return null;
        }
    });
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
        width: min-content;
    }

    .validation-text {
        position: absolute;
        bottom: -26px;
        right: 0;
        z-index: 2;
        font-size: 13px;
        color: var(--vt-c-red);
        pointer-events: none;
    }
</style>