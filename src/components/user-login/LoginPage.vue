<script setup>
    import UISelector from '../ui-selector/UISelector.vue';
    import LoginForm from './LoginForm.vue';
    import SvgIcon from '../SvgIcon.vue';
</script>

<template>
    <div class="login-page">
        <SvgIcon class="background" name="gradient-background" width="100%" height="100%"/>
        <div class="login-background">
            <UISelector id="ui-selector"/><br>
            <LoginForm/>
        </div>
    </div>
</template>

<style>
    .login-page {
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