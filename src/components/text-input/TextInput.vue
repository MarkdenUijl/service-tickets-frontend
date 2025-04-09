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
        }
    });

    const isFocussed = ref(false);
    const inputValue = ref('');

    const isFilled = computed(() => isFocussed.value || inputValue.value !== '');
</script>

<template>
    <div id="input-field">
        <motion.label
            class="input-placeholder"
            for="text-input"
            :animate="{
                top: isFilled ? -12 : 18,
                left: isFilled ? 10 : 18,
                fontSize: isFilled ? '12px' : '16px',
                color: isFocussed ? 'var(--color-text)' : 'var(--color-subtext)',
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
               id="text-input" 
               :name="props.placeholder" 
               v-model="inputValue"
               @focus="isFocussed = true" 
               @blur="isFocussed = false">
    </div>
</template>
  
<style scoped>
    #input-field {
        position: relative;
        width: 300px;
        height: 60px;
    }

    .text-input {
        outline: none;
        position: absolute;
        left: 0;
        width: inherit;
        height: inherit;
        flex-shrink: 0;
        background-color: var(--color-background);
        border: 1px solid var(--color-subtext);
        color: var(--color-subtext);
        border-radius: 4px;
        padding-left: 16px;
        z-index: 0;
    }

    .text-input.focussed {
        color: var(--color-text);
        border: 1px solid var(--color-text);
    }

    .input-placeholder {
        position: relative;
        padding: 3px;
        z-index: 1;
        color: var(--color-subtext);
        background-color: var(--color-background);
        left: 16px;
        top: 18px;
        font-size: 16px;
    }
</style>