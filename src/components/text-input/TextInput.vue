<script setup>
    import { ref, computed } from 'vue';
    import { motion } from 'motion-v';

    const props = defineProps({
        placeholder: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        validationColor: {
            type: String,
            required: false
        }
    });

    const emit = defineEmits(['blur']);

    const modelValue = defineModel();
    const isFocussed = ref(false);

    const handleFocus = () => {
        isFocussed.value = true;
    };

    const handleBlur = () => {
        isFocussed.value = false;
        emit('blur');
    };
    

    const isFilled = computed(() => isFocussed.value || modelValue.value !== '');
    
    const inputColor = computed(() => {
        return props.validationColor || (isFocussed.value ? 'var(--color-text)' : 'var(--color-subtext)');
    });
</script>

<template>
    <div class="input-field">
        <motion.label
            class="input-placeholder"
            for="text-input"
            :animate="{
                top: isFilled ? -12 : 18,
                left: isFilled ? 10 : 18,
                fontSize: isFilled ? '12px' : '16px',
                color: inputColor,
            }"
            :transition="{
                type: 'spring',
                stiffness: 300,
                damping: 20
            }"
            >
                {{ props.placeholder }}
        </motion.label>

        <input class="text-input"
            :class="{ focussed : isFocussed }" 
            :type="props.type" 
            :name="props.placeholder"
            v-model="modelValue"
            :style="{
                borderColor: inputColor,
                color: inputColor
            }"
            @focus="handleFocus" 
            @blur="handleBlur">
    </div>
</template>
  
<style scoped>
    .input-field {
        font-family: 'Ubuntu', sans-serif;
        width: 300px;
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
        background-color: var(--color-background);
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
        box-shadow: 0 0 0px 1000px var(--color-background) inset !important;
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
        background-color: var(--color-background);
        left: 16px;
        top: 18px;
        font-size: 16px;
        width: min-content;
    }
</style>