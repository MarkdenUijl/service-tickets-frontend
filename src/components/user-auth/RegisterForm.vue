<script setup>
import { reactive, computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import api from '@/services/api'

import ValidatedInput from '../user-input/ValidatedInput.vue'
import ValidatedPhoneInput from '../user-input/ValidatedPhoneInput.vue'
import LoaderButton from '../buttons/LoaderButton.vue'
import { capitalizeWords } from '@/utils/capitalizeWords'
import { isEmail, isStrongPassword } from '@/utils/validators'

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  countryCode: '+31',
  password: '',
  passwordConfirmation: ''
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirmation: ''
})

const { t } = useI18n()
const router = useRouter()
const emit = defineEmits(['form-progress'])
const loading = ref(false)

// --- Field-level validity (for UI states)
const isFirstNameValid = computed(() => formData.firstName.trim().length > 0)
const isLastNameValid = computed(() => formData.lastName.trim().length > 0)
const isEmailValid = computed(() => isEmail(formData.email) && !errors.email)
const isPhoneValid = computed(() => formData.phoneNumber?.trim().length > 0)
const isPasswordValid = computed(() => isStrongPassword(formData.password))
const isPasswordConfirmationValid = computed(
  () =>
    formData.password.length > 0 &&
    formData.passwordConfirmation.length > 0 &&
    formData.password === formData.passwordConfirmation
)

const formCompletion = computed(() => {
  const checks = [
    isFirstNameValid.value,
    isLastNameValid.value,
    isEmailValid.value,
    isPhoneValid.value,
    isPasswordValid.value,
    isPasswordConfirmationValid.value
  ]
  return (checks.filter(Boolean).length / checks.length) * 100
})

watch(formCompletion, (val) => emit('form-progress', val))

// --- DRY validators that return i18n error keys (or empty string)
const validateEmail = (val) => {
  if (!val) return 'emptyFieldError'
  if (!isEmail(val)) return 'emailInvalid'
  return ''
}

const validatePhone = (val) => {
  if (!val) return 'emptyFieldError'
  const cleaned = val.replace(/\D/g, '')
  if (cleaned.length < 8) return 'phoneTooShort'
  if (cleaned.length > 15) return 'phoneTooLong'
  return ''
}

const validatePassword = (val) => {
  if (!val) return 'emptyFieldError'
  if (val.length < 8) return 'passwordTooShort'
  if (!/[A-Z]/.test(val)) return 'passwordMissingUppercase'
  if (!/[a-z]/.test(val)) return 'passwordMissingLowercase'
  if (!/\d/.test(val)) return 'passwordMissingDigit'
  if (!/[^A-Za-z\d]/.test(val)) return 'passwordMissingSpecial'
  if (!isStrongPassword(val)) return 'passwordInvalid'
  return ''
}

const validatePasswordConfirmation = (pass, confirm) => {
  if (!confirm) return 'emptyFieldError'
  if (!pass) return 'emptyFieldError'
  if (pass !== confirm) return 'passwordMismatch'
  return ''
}

// --- "Soft" live validation (don’t shout when empty while typing)
watch(
  () => formData.firstName,
  () => {
    errors.firstName = ''
  }
)

watch(
  () => formData.lastName,
  () => {
    errors.lastName = ''
  }
)

watch(
  () => formData.email,
  (val) => {
    errors.email = val.length === 0 ? '' : validateEmail(val)
  }
)

watch(() => formData.phone, (val) => {
  errors.phone = val.length === 0 ? '' : validatePhone(val)
})

watch(
  () => formData.password,
  (val) => {
    errors.password = val.length === 0 ? '' : validatePassword(val)
  }
)

watch(
  [() => formData.password, () => formData.passwordConfirmation],
  ([pass, confirm]) => {
    errors.passwordConfirmation =
      confirm.length === 0 ? '' : validatePasswordConfirmation(pass, confirm)
  }
)

const resetForm = () => {
  Object.keys(formData).forEach((k) => (formData[k] = ''))
  Object.keys(errors).forEach((k) => (errors[k] = ''))
}

const register = async () => {
  if (loading.value) return

  // Strict validation on submit
  errors.firstName = formData.firstName ? '' : 'emptyFieldError'
  errors.lastName = formData.lastName ? '' : 'emptyFieldError'
  errors.email = validateEmail(formData.email)
  errors.phone = validatePhone(formData.phone)
  errors.password = validatePassword(formData.password)
  errors.passwordConfirmation = validatePasswordConfirmation(
    formData.password,
    formData.passwordConfirmation
  )

  const hasErrors = Object.values(errors).some(Boolean)
  if (hasErrors) return

  loading.value = true

  const payload = {
    firstName: capitalizeWords(formData.firstName.trim()),
    lastName: capitalizeWords(formData.lastName.trim()),
    email: formData.email.trim().toLowerCase(),
    phoneNumber: `${formData.countryCode}${formData.phone.replace(/\D/g, '')}`,
    password: formData.password
  }

  try {
    await api.post('/users', payload)
    resetForm()
    router.push('confirmation')
  } catch (error) {
    const status = error?.response?.status
    if (status === 409) {
      errors.email = 'emailConflict'
    } else {
      errors.email = 'serverError'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form id="registration-form" @submit.prevent="register">
    <div id="registration-name-form">
      <ValidatedInput
        id="firstname"
        v-model="formData.firstName"
        :placeholder="t('auth.registerFirstName')"
        type="text"
        name="given-name"
        autocomplete="given-name"
        :isValid="isFirstNameValid"
        :validationText="errors.firstName ? t(`auth.${errors.firstName}`) : ''"
        validationMode="both"
      />

      <ValidatedInput
        id="lastname"
        v-model="formData.lastName"
        :placeholder="t('auth.registerLastName')"
        type="text"
        name="family-name"
        autocomplete="family-name"
        :isValid="isLastNameValid"
        :validationText="errors.lastName ? t(`auth.${errors.lastName}`) : ''"
        validationMode="both"
      />
    </div>

    <ValidatedInput
      id="email"
      v-model="formData.email"
      :placeholder="t('auth.email')"
      type="email"
      name="email"
      autocomplete="email"
      :isValid="isEmailValid"
      :validationText="errors.email ? t(`auth.${errors.email}`) : ''"
      validationMode="both"
    />

    <ValidatedPhoneInput
      id="phone"
      v-model="formData.phone"
      :countryCode="formData.countryCode"
      :placeholder="t('auth.phone')"
      @update:countryCode="formData.countryCode = $event"
      :isValid="isPhoneValid"
      :validationText="errors.phone ? t(`auth.${errors.phone}`) : ''"
      validationMode="both"
    />

    <ValidatedInput
      id="password"
      v-model="formData.password"
      :placeholder="t('auth.password')"
      type="password"
      name="new-password"
      autocomplete="new-password"
      :isValid="isPasswordValid"
      :validationText="errors.password ? t(`auth.${errors.password}`) : ''"
      validationMode="both"
    />

    <ValidatedInput
      id="confirm-password"
      v-model="formData.passwordConfirmation"
      :placeholder="t('auth.passwordConfirm')"
      type="password"
      name="new-password"
      autocomplete="new-password"
      :isValid="isPasswordConfirmationValid"
      :validationText="errors.passwordConfirmation ? t(`auth.${errors.passwordConfirmation}`) : ''"
      validationMode="both"
    />

    <LoaderButton :loading="loading" :label="t('auth.submitButtonText')" type="submit" />
  </form>
</template>

<style>
#registration-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  align-items: center;
  position: relative;
}

#registration-name-form {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 8px;
}

#registration-name-form > * {
  flex: 1;
}

#return-button {
  display: flex;
  border: solid var(--color-highlight) 2px;
  align-items: center;
  justify-content: center;
  width: 300px;
  height: 44px;
  border-radius: 8px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
}

#register-return-link {
  color: var(--color-highlight);
  font-family: 'Ubuntu';
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 635px) {
  #registration-name-form {
    flex-direction: column;
  }
}
</style>