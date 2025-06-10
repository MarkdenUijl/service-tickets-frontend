<script setup>
    import { ref } from 'vue';
    import RegisterForm from '@/components/user-auth/RegisterForm.vue';
    import LogoIcon from '@/components/graphic-items/LogoIcon.vue';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();

    const formProgress = ref(0);
    const emit = defineEmits(['form-progress']);

    function handleFormProgress(value) {
        formProgress.value = value;
        emit('form-progress', value);
    }
</script>

<template>
    <div id="register-page-content">
        <div 
            id="auth-header-text"
            style="align-self: flex-start"
        >
            <div id="auth-header-title">
                <LogoIcon />
                <span :style="{ 'font-weight' : 800, 'font-size' : '20px' }">HELVAR SUPPORT PORTAL</span>
            </div>

            <span id="auth-header-subtext">
                {{ t('registerHeaderSubtext') }}
            </span>
        </div> 

        <RegisterForm @form-progress="handleFormProgress" />

        <div id="horizontal-divider">
            <span class="horizontal-divider-bar"></span>
            {{ t("loginDividerText") }}
            <span class="horizontal-divider-bar"></span>
        </div>

        <div class="create-account-options">
            <span style="color: var(--color-subtext)">
                {{ t('alreadyHaveAccountText') }}
            </span>

            <router-link
                to="/auth/login"
                style="color: var(--vt-c-highlight); cursor: pointer; text-decoration: none"
            >
                {{ t('registerReturnText') }}
            </router-link>
        </div>
    </div>
</template>

<style>
    #register-page-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        width: 80%;
        box-sizing: border-box;
    }
</style>