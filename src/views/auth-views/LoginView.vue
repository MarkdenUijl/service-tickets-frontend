<script setup>
import LoginForm from '@/components/user-auth/LoginForm.vue'
import LogoIcon from '@/components/graphic-items/LogoIcon.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main class="login-page" role="main">
    <header class="auth-header" aria-labelledby="auth-title">
      <div class="auth-header-title">
        <LogoIcon aria-hidden="true" />
        <h1 id="auth-title" class="brand-title">HELVAR SUPPORT PORTAL</h1>
      </div>

      <p class="auth-header-subtext">
        {{ t('auth.loginHeaderSubtext') }}
      </p>
    </header>

    <LoginForm />

    <div class="horizontal-divider">
      <span class="divider-bar"></span>
      {{ t('auth.loginDividerText') }}
      <span class="divider-bar"></span>
    </div>

    <div class="create-account-options">
      <span class="new-here-text">
        {{ t('auth.loginNewHereText') }}
      </span>
      <router-link to="/auth/register" class="create-account-link">
        {{ t('auth.loginCreateAccountText') }}
      </router-link>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 300px;
  box-sizing: border-box;
}

.auth-header {
  width: 100%;
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

.new-here-text {
  color: var(--color-subtext);
}

.create-account-link {
  color: var(--color-highlight);
  text-decoration: none;
  cursor: pointer;
}

.create-account-link:hover {
  text-decoration: underline;
}
</style>