<script setup>
    import UISelector from '@/components/ui-selector/UISelector.vue';
    import SvgIcon from '@/components/svg-icon/SvgIcon.vue';
    import LogoLarge from '@/components/graphic-items/LogoLarge.vue';

    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
</script>

<template>
    <div class="auth-page">

        <LogoLarge id="homescreen-logo"/>
        
        <SvgIcon class="background" name="gradient-background" />

        <div class="auth-background">
            <UISelector id="ui-selector"/><br>
            
            
        </div>
    </div>
</template>

<style>
   
</style>