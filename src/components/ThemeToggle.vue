<script setup>
    import { useDark, useToggle } from '@vueuse/core';
    import { motion } from 'motion-v'

    
    const isDark = useDark({
        selector: "body",
        attribute: "color-scheme",
        valueDark: "dark",
        valueLight: "light",
        storageKey: "vueuse-color-scheme",
        initialValue: "auto",
    });

    const ToggleDark = useToggle();

</script>

<template>

    <div color-scheme=" isDark ? 'light' : 'dark' ">
        <label :class="['ThemeToggler', isDark ? 'end' : 'start']">
            <input type="checkbox" v-model="isDark">
            <motion.div
                :data-state="isDark"
                class="toggle-handle"
                layout
                :transition="{
                    type: 'spring',
                    visualDuration: 0.5,
                    bounce: 0.2,
                }"
            />
        </label>
    </div>
    
</template>


<style>

    .ThemeToggler input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    [color-scheme= 'dark'] {
        --color-background: var(--vt-c-black);
        --color-text: var(--vt-c-white);
    }

    [color-scheme= 'light'] {
        --color-background: var(--vt-c-white);
        --color-text: var(--vt-c-black);
    } 

    .ThemeToggler {
        width: 40px;
        height: 20px;
        background-color: #bc64ff;
        border-radius: 20px;
        cursor: pointer;
        position: relative;
        display: flex;
    }

    .tThemeToggler.start {
        justify-content: flex-start;
    }

    .ThemeToggler.end {
        justify-content: flex-end;
    }

    .toggle-handle {
        width: 20px;
        height: 20px;
        background-color: #9911ff;
        border-radius: 50%;
    }
    
</style>
