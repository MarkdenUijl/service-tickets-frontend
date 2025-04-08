<script setup>
    import ThemeToggle from './components/ThemeToggle.vue';
    import { useI18n } from 'vue-i18n';
    import LanguageSwitcher from './components/LanguageSwitcher.vue';


    const { t } = useI18n();
</script>

<template>
    <!-- <body>
        <ThemeToggle/>
       
    </body> -->
    <div>
        <LanguageSwitcher />
        <p>{{ t('welcome') }}</p>
    </div>
</template>

<style scoped>

</style>
