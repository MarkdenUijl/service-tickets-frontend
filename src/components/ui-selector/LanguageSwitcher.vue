<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import SvgIcon from '../svg-icon/SvgIcon.vue'

const { locale } = useI18n()

const LANGUAGES = [
  { code: 'nl', icon: 'Flag-NL', label: 'Nederlands' },
  { code: 'en', icon: 'Flag-UK', label: 'English' }
]
const SUPPORTED_CODES = LANGUAGES.map((l) => l.code)

const setLanguage = (newLang) => {
  if (newLang === locale.value) return // no-op if already selected
  locale.value = newLang
  localStorage.setItem('lang', newLang)
}

onMounted(() => {
  const stored = localStorage.getItem('lang')
  if (stored && SUPPORTED_CODES.includes(stored)) {
    locale.value = stored
  }
})

const isCurrentLang = (code) => locale.value === code
</script>

<template>
  <div class="language-switcher">
    <button
      v-for="lang in LANGUAGES"
      :key="lang.code"
      type="button"
      class="language-btn"
      :class="{ active: isCurrentLang(lang.code) }"
      :aria-pressed="isCurrentLang(lang.code)"
      :aria-label="`Switch language to ${lang.label}`"
      :title="lang.label"
      @click="setLanguage(lang.code)"
    >
      <SvgIcon
        class="flag"
        :name="lang.icon"
        width="40px"
        height="28px"
        radius="4px"
      />
    </button>
  </div>
</template>

<style>
.language-switcher {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.language-switcher .language-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  opacity: 0.2; /* default dimmed */
  border: none;       /* ensure button reset styles */
  background: none;   /* ensure button reset styles */
  padding: 0;         /* tighten hit area to SVG size */
  cursor: pointer;
}

.language-switcher .language-btn.active {
  opacity: 1;
}

.language-switcher .flag {
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.25);
}
</style>