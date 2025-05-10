<script setup>
    import UISelector from '@/components/ui-selector/UISelector.vue';
    import LoginForm from '@/components/user-auth/LoginForm.vue';
    import SvgIcon from '@/components/svg-icon/SvgIcon.vue';
    import LogoLarge from '@/components/graphic-items/LogoLarge.vue';
    import LogoIcon from '@/components/graphic-items/LogoIcon.vue';

    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
</script>

<template>
    <div class="auth-page">

        <LogoLarge id="homescreen-logo"/>
        
        <SvgIcon class="background" name="gradient-background" />

        <div class="auth-background">
            <UISelector id="ui-selector"/><br>
            
            <div id="login-page-content">
                <div id="login-header-text">
                    <div id="login-header-title">
                        <LogoIcon />
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
                    <span :style="{ 'color' : 'var(--color-subtext)' }"> 
                        {{ t('loginNewHereText') }} 
                    </span>

                    <router-link
                        to="/register"
                        :style="{ 
                            color: 'var(--vt-c-highlight)',
                            cursor: 'pointer',
                            textDecoration: 'none'
                         }"
                    >
                        {{ t('loginCreateAccountText') }}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    .auth-page {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: stretch;
        min-height: 100vh;
        width: 100%;
        box-sizing: border-box;
    }

    .auth-background {
        background-color: var(--color-background);
        width: 40%;
        max-width: 560px;
        min-width: 400px;
        height: 100vh;
        box-sizing: border-box;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: -4px 4px 4px 0px rgba(0, 0, 0, 0.10);
        z-index: 1;
        border-radius: 0;
        transition: all 0.3s ease;
        position: relative;
    }

    #login-page-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        width: 100%;
        max-width: 300px;
        box-sizing: border-box;
    }

    #homescreen-logo {
        position: absolute;
        left: 16px;
        top: 16px;
        width: 48px;
        height: auto;
        z-index: 1;
        box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.25);
        transition: all 0.3s ease;
    }

    #login-header-title {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        gap: 4px;
        flex-wrap: wrap;
    }

    #login-header-title span {
        font-weight: 800;
        font-size: clamp(16px, 5vw, 24px);
    }

    #login-header-subtext {
        color: var(--color-subtext);
        text-wrap: wrap;
        font-size: clamp(12px, 4vw, 16px);
    }

    #horizontal-divider {
        display: flex;
        flex-direction: row;
        width: 60%;
        justify-content: center;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .horizontal-divider-bar {
        height: 1px;
        flex: 1;
        background-color: var(--color-subtext);
        max-width: auto;
    }

    .create-account-options {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
        text-align: center;
    }

    .background {
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        z-index: 0;
        pointer-events: none;
    }

    #ui-selector {
        position: absolute;
        top: 16px;
        right: 16px;
    }

    @media (max-width: 635px) {
        .auth-page {
            flex-direction: column;
            justify-content: center;
        }

        .auth-background {
            width: 100%;
            height: 90%;
            max-width: 100%;
            border-radius: 24px 24px 0 0;
            padding: 16px;
        }

        #homescreen-logo {
            display: none;
        }
    }
</style>