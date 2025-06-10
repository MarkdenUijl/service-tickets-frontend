<script setup>
    import { useRoute } from 'vue-router';

    const route = useRoute();

</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-index-background">

    </div>
  </div>
</template>

<style scoped>
    .dashboard-page {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: stretch;
        min-height: 100vh;
        width: 100%;
        box-sizing: border-box;
    }

    .dashboard-index-background {
        background-color: var(--color-menu-background);
        min-width: 400px;
        height: 100dvh;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1;
        border-radius: 0;
        position: relative;
        border: red double 2px;
    }
</style>