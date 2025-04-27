<script setup>
    import UISelector from './components/ui-selector/UISelector.vue';
    import LoginForm from './components/user-login/LoginForm.vue';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
</script>

<template>
    <body>
        <UISelector/><br>
        <LoginForm/>
        <!-- <TextInput placeholder="Password" type="password"/> -->
        <!-- <div>
            <p>{{ t('welcome') }}</p>
        </div> -->
    </body>
    
</template>

<style scoped>

</style>
