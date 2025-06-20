<script setup>
    import { useTheme } from '@/utils/useTheme';

    /* DO NOT REMOVE - USED FOR GLOBAL THEME STYLING */
    const { isDark } = useTheme();
</script>

<template>
    <body>
        <router-view/>
    </body>
</template>

<style scoped>

</style>
