<script setup>
    import LoginForm from '@/components/user-auth/LoginForm.vue';
    import LogoIcon from '@/components/graphic-items/LogoIcon.vue';

    import { useI18n } from 'vue-i18n';
    const { t } = useI18n();
</script>

<template>
    <div id="login-page-content">
        <div id="auth-header-text">
            <div id="auth-header-title">
                <LogoIcon />
                <span style="font-weight: 800; font-size: 20px">HELVAR SERVICE TICKETS</span>
            </div>

            <span id="auth-header-subtext">
                {{ t('loginHeaderSubtext') }}
            </span>
        </div>

        <LoginForm />

        <div id="horizontal-divider">
            <span class="horizontal-divider-bar"></span>
            {{ t("loginDividerText") }}
            <span class="horizontal-divider-bar"></span>
        </div>

        <div class="create-account-options">
            <span style="color: var(--color-subtext)">
                {{ t('loginNewHereText') }}
            </span>

            <router-link
                to="/auth/register"
                style="color: var(--vt-c-highlight); cursor: pointer; text-decoration: none"
            >
                {{ t('loginCreateAccountText') }}
            </router-link>
        </div>
    </div>
</template>

<style>
    #login-page-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        width: 100%;
        max-width: 300px;
        box-sizing: border-box;
    }
</style>