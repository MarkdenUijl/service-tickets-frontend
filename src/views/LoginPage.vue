<script setup>
    import UISelector from '@/components/ui-selector/UISelector.vue';
    import LoginForm from '@/components/user-login/LoginForm.vue';
    import SvgIcon from '@/components/svg-icon/SvgIcon.vue';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
</script>

<template>
    <div class="login-page">

        <SvgIcon class="helvar-logo" name="helvar-logo" width="200px" height="80px" radius="10px"/>
        
        <SvgIcon class="background" name="gradient-background" />

        <div class="login-background">
            <UISelector id="ui-selector"/><br>
            
            <div id="login-page-content">
                <div id="login-header-text">
                    <div id="login-header-title">
                        <SvgIcon name="helvar-logo-small" width="28px" height="28px"/>
                        <span :style="{ 'font-weight' : 800, 'font-size' : '20px' }">HELVAR SERVICE TICKETS</span>
                    </div>

                    <span id="login-header-subtext">
                        {{ t('loginHeaderSubtext') }}
                    </span>
                </div>

                <LoginForm/>

                <div id="horizontal-divider">
                    <span class="horizontal-divider-bar"></span>
                    {{ t("loginDividerText") }}
                    <span class="horizontal-divider-bar"></span>
                </div>

                <div class="create-account-options">
                    <span :style="{ 'color' : 'var(--color-subtext)'}"> 
                        {{ t('loginNewHereText') }} 
                    </span>


                    <div id="forgot-password">
                        <!-- TURN INTO LINK -->
                        {{ t('loginCreateAccountText') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    #login-page-content {
        display: flex;
        flex-direction: column;
        gap: 32px;
        max-width: 300px;
    }

    #login-header-title {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        gap: 4px;
    }

    #login-header-subtext {
        color: var(--color-subtext);
        text-wrap: wrap;
    }

    #horizontal-divider {
        display: flex;
        flex-direction: row;
        width: auto;
        justify-content: center;
        align-items: center;
        gap: 8px;
    }

    .horizontal-divider-bar {
        height: 1px;
        width: 40px;
        flex: 1;
        background-color: var(--color-subtext);
    }

    .create-account-options {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 16px;
    }

    .background{
        position: absolute;
        left: 0;
        top: 0;
    }

    .helvar-logo {
        position: absolute;
        left: 24px;
        top: 24px;
        z-index: 1;
        box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.25);
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