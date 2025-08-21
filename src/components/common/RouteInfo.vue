<script setup>
    import { computed } from 'vue';
    import { useRoute } from 'vue-router';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const route = useRoute();

    const pageName = computed(() => {
        const matched = route.matched[route.matched.length - 1];
        const key = matched?.meta?.titleKey;
        
        return key ? t(key) : '';
    })
</script>

<template>
    <div class="route-info-container">
        <span>{{ pageName }}</span>
    </div>
</template>

<style scoped>
    .route-info-container {
        margin-left: 16px;
    }

    .route-info-container span {
        font-family: 'Noto Sans JP';
        font-size: 32px;
        font-weight: 900;
        color: white;
        font-style: normal;
        line-height: normal;
    }
</style>