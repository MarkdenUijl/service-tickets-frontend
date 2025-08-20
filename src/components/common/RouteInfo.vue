<script setup>
    import { computed } from 'vue';
    import { useRoute } from 'vue-router';

    const route = useRoute();

    const pageName = computed(() => {
        const rawName = route.path.split('/')[2];
        const capitalized = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        
        return capitalized;
    })
</script>

<template>
    <div class="route-info-container">
        <span>{{ pageName }}</span>
    </div>
</template>

<style scoped>
    .route-info-container span {
        font-family: 'Noto Sans JP';
        font-size: 32px;
        font-weight: 900;
        color: white;
        font-style: normal;
        line-height: normal;
    }
</style>