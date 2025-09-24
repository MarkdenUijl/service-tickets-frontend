<script setup>
import { ref } from 'vue'
import RegisterForm from '@/components/user-auth/RegisterForm.vue'
import LogoIcon from '@/components/graphic-items/LogoIcon.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const formProgress = ref(0)
const emit = defineEmits(['form-progress'])

function handleFormProgress(value) {
  formProgress.value = value
  emit('form-progress', value)
}
</script>

<template>
  <main id="register-page-content" role="main">
    <header class="auth-header" aria-labelledby="auth-title">
      <div class="auth-header-title">
        <LogoIcon aria-hidden="true" />
        <h1 id="auth-title" class="brand-title">HELVAR SUPPORT PORTAL</h1>
      </div>

      <p class="auth-header-subtext">
        {{ t('auth.registerHeaderSubtext') }}
      </p>
    </header>

    <RegisterForm @form-progress="handleFormProgress" />

    <div class="horizontal-divider">
      <span class="divider-bar"></span>
      {{ t('auth.loginDividerText') }}
      <span class="divider-bar"></span>
    </div>

    <div class="create-account-options">
      <span class="already-account-text">
        {{ t('auth.alreadyHaveAccountText') }}
      </span>
      <router-link to="/auth/login" class="return-link">
        {{ t('auth.registerReturnText') }}
      </router-link>
    </div>
  </main>
</template>

<style scoped>
#register-page-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 90%;          /* let it breathe wider than login */
  max-width: 600px;    /* cap at a comfortable width */
  box-sizing: border-box;
}

.auth-header {
  width: 100%;
  align-self: flex-start;
}

.auth-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-title {
  margin: 0;
  font-weight: 800;
  font-size: 20px;
}

.auth-header-subtext {
  margin-top: 8px;
}

.horizontal-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: center;
}

.divider-bar {
  flex: 1;
  height: 1px;
  background-color: var(--color-subtext);
}

.create-account-options {
  display: flex;
  gap: 4px;
  align-items: baseline;
}

.already-account-text {
  color: var(--color-subtext);
}

.return-link {
  color: var(--color-highlight);
  text-decoration: none;
  cursor: pointer;
}

.return-link:hover {
  text-decoration: underline;
}
</style>