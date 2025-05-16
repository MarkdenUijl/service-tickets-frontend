<script setup>
    import AuthLayout from '@/components/layouts/AuthLayout.vue';
    import LoginForm from '@/components/user-auth/LoginForm.vue';
    import LogoIcon from '@/components/graphic-items/LogoIcon.vue';

    import { useI18n } from 'vue-i18n';
    const { t } = useI18n();
</script>

<template>
    <AuthLayout>
        <div id="login-page-content">
            <div id="login-header-text">
                <div id="login-header-title">
                <LogoIcon />
                <span style="font-weight: 800; font-size: 20px">HELVAR SERVICE TICKETS</span>
                </div>

                <span id="login-header-subtext">
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
                to="/register"
                style="color: var(--vt-c-highlight); cursor: pointer; text-decoration: none"
                >
                {{ t('loginCreateAccountText') }}
                </router-link>
            </div>
        </div>
    </AuthLayout>
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
</style>