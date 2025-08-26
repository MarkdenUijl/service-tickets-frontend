<script setup>
</script>

<template>
    <div class="spinner-container">
        <div class="spinner"></div>
    </div>
</template>

<style scoped>
    .spinner {
        width: 100%;
        aspect-ratio: 1;
        max-width: 24px;
        max-height: 24px;
        border: 3px solid var(--color-subtext);
        border-top-color: var(--color-text);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .spinner-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>