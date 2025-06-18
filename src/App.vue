<script setup>
    import { useTheme } from '@/utils/useTheme';

    const { isDark } = useTheme();
</script>

<template>
    <body>
        <router-view/>
    </body>
</template>

<style scoped>

</style>
