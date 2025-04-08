<script setup>
    import UISelector from './components/ui-selector/UISelector.vue';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
</script>

<template>
    <body>
        <UISelector/>
        
        <div>
            <p>{{ t('welcome') }}</p>
        </div>
    </body>
    
</template>

<style scoped>

</style>
