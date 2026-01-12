<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { isEmail } from '@/utils/validators'
import { useAuthStore } from '@/stores/authStore'
import LoaderButton from '../buttons/LoaderButton.vue'
import ValidatedInput from '../user-input/ValidatedInput.vue'

const formData = reactive({
  email: '',
  password: '',
  tokenPersist: false
})

const errors = reactive({
  login: '',
  email: ''
})

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const loading = ref(false)

const isEmailValid = computed(() => isEmail(formData.email) && !errors.email)
const isLoginValid = computed(() => !errors.login)

watch(
  () => formData.email,
  () => {
    errors.email = ''
    errors.login = ''
  }
)

watch(
  () => formData.password,
  () => {
    errors.login = ''
  }
)

const validate = () => {
  errors.email = ''
  errors.login = ''
  let ok = true

  if (!formData.email) {
    errors.email = 'emptyFieldError'
    ok = false
  } else if (!isEmail(formData.email)) {
    errors.email = 'emailInvalid'
    ok = false
  }

  if (!formData.password) {
    errors.login = 'emptyFieldError'
    ok = false
  }

  return ok
}

const login = async () => {
  if (loading.value) return // guard against double-submits
  const isValid = validate()
  if (!isValid) return

  loading.value = true

  try {
    await auth.login({
      email: formData.email,
      password: formData.password,
      tokenPersist: formData.tokenPersist,
    })

    router.push('/dashboard/tickets')
  } catch (error) {
    // The store throws a normalized error object.
    if (error?.type === 'unauthorized') {
      errors.email = 'emailIncorrect'
    } else if (error?.uiMessageKey) {
      // Allows backend-driven (or store-mapped) messaging without leaking raw errors.
      errors.login = error.uiMessageKey
    } else {
      errors.login = 'serverError'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form id="login-form" @submit.prevent="login">
    <ValidatedInput
      id="email"
      v-model="formData.email"
      :placeholder="t('auth.email')"
      type="email"
      name="email"
      autocomplete="email"
      :isValid="isEmailValid"
      :validationText="errors.email ? t(`auth.${errors.email}`) : ''"
    />

    <ValidatedInput
      id="password"
      v-model="formData.password"
      :placeholder="t('auth.password')"
      type="password"
      name="password"
      autocomplete="current-password"
      :isValid="isLoginValid"
      :validationText="errors.login ? t(`auth.${errors.login}`) : ''"
    />

    <div class="login-options">
      <label id="remember-me">
        <input id="remember-me-checkbox" type="checkbox" v-model="formData.tokenPersist" />
        <span> {{ t('auth.rememberMeText') }} </span>
      </label>

      <div id="forgot-password">
        <!-- TURN INTO LINK -->
        {{ t('auth.forgotPasswordText') }}
      </div>
    </div>

    <LoaderButton :loading="loading" :label="t('auth.loginButtonText')" type="submit" />
  </form>
</template>

<style>
#login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.login-options {
  width: 300px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 400;
}

#remember-me {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-subtext);
  cursor: pointer;
  position: relative;
}

#remember-me input {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  height: 14px;
  width: 14px;
  border: 1px solid var(--color-subtext);
  border-radius: 4px;
}

#remember-me input:checked {
  background-color: var(--color-highlight);
  border: var(--color-highlight);
}

#remember-me input[type='checkbox']:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 5px;
  width: 6px;
  height: 10px;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
  border-color: var(--vt-c-white);
  border-style: solid;
}

#forgot-password {
  color: var(--color-highlight);
}
</style>