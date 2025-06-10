<script setup>
    import { useI18n } from 'vue-i18n';
    import { onMounted } from 'vue';
    import { useTheme } from '@/utils/useTheme';

    const { t } = useI18n();

    onMounted(() => {
        useTheme().applyStoredTheme();
    });
</script>

<template>
    <body>
        <router-view/>
    </body>
</template>

<style scoped>

</style>
