<script setup>
import LogoIcon from '@/components/graphic-items/LogoIcon.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main class="confirmation-page" role="main">
    <header class="auth-header" aria-labelledby="auth-title">
      <div class="auth-header-title">
        <LogoIcon aria-hidden="true" />
        <h1 id="auth-title" class="brand-title">HELVAR SUPPORT PORTAL</h1>
      </div>

      <p class="auth-header-subtext">
        {{ t('auth.accountCreationSuccesful') }}
        <router-link to="/auth/login" class="back-link">
          {{ t('auth.backToLoginText') }}
        </router-link>
      </p>
    </header>
  </main>
</template>

<style scoped>
.confirmation-page {
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

.back-link {
  color: var(--color-highlight);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>