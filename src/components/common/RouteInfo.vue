<script setup>
    import { computed } from 'vue';
    import { useRoute } from 'vue-router';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const route = useRoute();

    const mainPath = computed(() => {
        const fullPath = route.path;
        const mainPathName = fullPath.split('/')[1];

        return mainPathName.charAt(0).toUpperCase() + mainPathName.slice(1);
    });

    const pageName = computed(() => {
        const matched = route.matched[route.matched.length - 1];
        const key = matched?.meta?.titleKey;
        
        return key ? t(key) : '';
    })
</script>

<template>
    <div class="route-info-container">
        <span class="route-info-title">{{ pageName }}</span>
        
        <div class="route-info-nav">
            <span id="main-path-title">{{ mainPath }}</span>
            <span> > </span>
            <span id="current-path-title">{{ pageName }}</span>
        </div>
    </div>
</template>

<style scoped>
    .route-info-container {
        margin-left: 16px;
        user-select: none;
        display: flex;
        flex-direction: column;
        color: white;
    }

    .route-info-title {
        font-family: 'Noto Sans JP';
        font-size: 32px;
        font-weight: 900;
        line-height: 32px;
    }

    .route-info-nav {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-size: 12px;
        gap: 16px;
        max-width: 160px;
    }

    #main-path-title {
        font-weight: 700;
    }
</style>