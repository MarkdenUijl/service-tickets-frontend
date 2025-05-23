<script setup>
    import LanguageSwitcher from './LanguageSwitcher.vue';
    import ThemeToggle from './ThemeToggle.vue';
</script>

<template>
    <div class="ui-selector">
        <ThemeToggle/>

        <span id="ui-selector-divider"/>

        <LanguageSwitcher/>
    </div>
</template>
  
<style>
    .ui-selector {
        z-index: 5;
        display: flex;
        flex-direction: row;
        gap: 16px;
        align-items: center;
        width: fit-content;
    }

    #ui-selector-divider {
        height: 24px;
        width: 1px;
        background-color: var(--vt-c-offwhite);
        border-radius: 1px;
    }
</style>