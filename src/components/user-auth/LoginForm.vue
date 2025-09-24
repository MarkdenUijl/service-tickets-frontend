<script setup>
import { reactive, ref, computed, watch } from 'vue'
import ValidatedInput from '../user-input/ValidatedInput.vue'
import { useI18n } from 'vue-i18n'
import api from '@/utils/api'
import { useRouter } from 'vue-router'
import { isEmail } from '@/utils/validators'
import LoaderButton from '../buttons/LoaderButton.vue'

const formData = reactive({
  email: '',
  password: '',
  // Checkbox should be boolean for v-model on input[type="checkbox"]
  tokenPersist: false
})

const errors = reactive({
  login: '',
  email: ''
})

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)

// Valid when util says email is valid AND there is no i18n error key set
const isEmailValid = computed(() => isEmail(formData.email) && !errors.email)
const isLoginValid = computed(() => !errors.login)

// Clear errors as the user edits (keeps UX responsive)
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

// Centralized validation to avoid duplicating regex/logic
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

  const payload = {
    username: formData.email.trim().toLowerCase(),
    password: formData.password,
    tokenPersist: formData.tokenPersist
  }

  try {
    const response = await api.post('/auth/login', payload)
    const token = response.data.token

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    const userResponse = await api.get('/users/me')
    const user = userResponse.data

    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)

    router.push('/dashboard/overview')
  } catch (error) {
    const status = error?.response?.status
    if (status === 401 || error?.type === 'unauthorized') {
      errors.email = 'emailIncorrect'
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
  border-color: white;
  border-style: solid;
}

#forgot-password {
  color: var(--color-highlight);
}
</style>