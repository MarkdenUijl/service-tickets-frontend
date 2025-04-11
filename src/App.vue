<script setup>
    import UISelector from './components/ui-selector/UISelector.vue';
    import ValidationTest from './components/text-input/ValidationTest.vue';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
</script>

<template>
    <body>
        <UISelector/><br>
        <ValidationTest/>
        <!-- <TextInput placeholder="Password" type="password"/> -->
        <!-- <div>
            <p>{{ t('welcome') }}</p>
        </div> -->
    </body>
    
</template>

<style scoped>

</style>
