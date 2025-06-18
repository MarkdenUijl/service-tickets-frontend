<script setup>
    import LogoIcon from '@/components/graphic-items/LogoIcon.vue';

    import { useI18n } from 'vue-i18n';
    const { t } = useI18n();
</script>

<template>
    <div id="confirmation-page-content">
        <div id="auth-header-text">
            <div id="auth-header-title">
                <LogoIcon />
                <span style="font-weight: 800; font-size: 20px">HELVAR SUPPORT PORTAL</span>
            </div>

            <span id="auth-header-subtext">
                {{ t('auth.accountCreationSuccesful') }}

                 <router-link
                    to="/auth/login"
                    style="color: var(--vt-c-highlight); cursor: pointer; text-decoration: none"
                >
                    {{ t('auth.backToLoginText') }}
                </router-link>
            </span>
        </div>
    </div>
</template>

<style>
    #confirmation-page-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        width: 100%;
        max-width: 300px;
        box-sizing: border-box;
    }
</style>