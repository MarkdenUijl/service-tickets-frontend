<script setup>
    import LoginPage from './components/user-login/LoginPage.vue';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
</script>

<template>
    <body>
        <LoginPage/>
    </body>
    
</template>

<style scoped>

</style>
