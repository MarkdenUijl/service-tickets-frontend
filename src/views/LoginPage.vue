<script setup>
    import UISelector from '@/components/ui-selector/UISelector.vue';
    import LoginForm from '@/components/user-login/LoginForm.vue';
    import SvgIcon from '@/components/svg-icon/SvgIcon.vue';
</script>

<template>
    <div class="login-page">
        <SvgIcon class="background" name="gradient-background" width="100%"/>
        <div class="login-background">
            <UISelector id="ui-selector"/><br>
            <LoginForm/>
        </div>
    </div>
</template>

<style>
    .background{
        position: absolute;
        left: 0;
        top: 0;
    }

    .login-page {
        position: relative;
        display: flex;
        justify-content: flex-end;
        height: 100vh;
    }

    .login-background {
        background-color: var(--color-background);
        min-width: 560px;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        position: relative;
        box-shadow: -4px 4px 4px 0px rgba(0, 0, 0, 0.10);
        z-index: 1;
    }

    #ui-selector {
        position: absolute;
        top: 24px;
        right: 24px;
    }
</style>