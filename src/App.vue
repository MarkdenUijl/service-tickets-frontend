<script setup>
    import UISelector from './components/ui-selector/UISelector.vue';
    import TextInput from './components/text-input/TextInput.vue';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
</script>

<template>
    <body>
        <UISelector/><br>
        <TextInput placeholder="Email" type="text" validationText="Passwords don't match."/>
        <!-- <TextInput placeholder="Password" type="password"/> -->
        <!-- <div>
            <p>{{ t('welcome') }}</p>
        </div> -->
    </body>
    
</template>

<style scoped>

</style>
