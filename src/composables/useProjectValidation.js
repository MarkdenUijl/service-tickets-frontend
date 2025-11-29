import { reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export function useProjectValidation(projectData) {
  const { t } = useI18n()

  // --- Reactive error messages (English placeholders)
  const errors = reactive({
    name: '',
    city: '',
    zipCode: '',
    street: '',
    houseNumber: ''
  })

  // --- Field-level validity (booleans), permissive when empty for live UX
  const isNameValid = computed(() => projectData.name.trim().length >= 5 || projectData.name.length === 0)
  const isCityValid = computed(() => projectData.city.trim().length > 0 || projectData.city.length === 0)
  const isZipCodeValid = computed(() => /^[1-9][0-9]{3}\s?(?!sa|sd|ss)[A-Za-z]{2}$/.test(projectData.zipCode.trim()) || projectData.zipCode.length === 0)
  const isStreetValid = computed(() => projectData.street.trim().length > 0 || projectData.street.length === 0)
  const isHouseNumberValid = computed(() => /^(\d+)([A-Za-z])?$/.test(projectData.houseNumber.trim()) || projectData.houseNumber.length === 0)

  // --- Soft/live validation watchers (don’t shout on empty)
  watch(() => projectData.name, (val) => {
    if (val.length === 0) errors.name = ''
    else if (val.trim().length < 5) errors.name = t('project.creationErrorNameShortText')
    else errors.name = ''
  })
  
  watch(() => projectData.city, (val) => {
    errors.city = val.length === 0 ? '' : (val.trim().length > 0 ? '' : t('project.creationErrorCityRequiredText'))
  })

  watch(() => projectData.zipCode, (val) => {
    if (val.length === 0) errors.zipCode = ''
    else if (!/^[1-9][0-9]{3}\s?(?!sa|sd|ss)[A-Za-z]{2}$/.test(val.trim())) errors.zipCode = t('project.creationErrorInvalidZipCodeText')
    else errors.zipCode = ''
  })

  watch(() => projectData.street, (val) => {
    errors.street = val.length === 0 ? '' : (val.trim().length > 0 ? '' : t('project.creationErrorStreetRequiredText'))
  })

  watch(() => projectData.houseNumber, (val) => {
    if (val.length === 0) errors.houseNumber = ''
    else if (!/^(\d+)([A-Za-z])?$/.test(val.trim())) errors.houseNumber = t('project.creationErrorNumberNotDigitsText')
    else errors.houseNumber = ''
  })


  // --- Strict validation on submit
  function validateAll() {
    // Track errors for required fields
    let hasError = false

    // Required: name
    if (!projectData.name || projectData.name.trim().length === 0) {
      errors.name = t('project.creationErrorNameRequiredText')
      hasError = true
    } else if (projectData.name.trim().length < 5) {
      errors.name = t('project.creationErrorNameShortText')
      hasError = true
    }

    // Address fields are required for project context (based on current UX)
    if (!projectData.city || projectData.city.trim().length === 0) {
      errors.city = t('project.creationErrorCityRequiredText')
      hasError = true
    }

    if (!projectData.zipCode || projectData.zipCode.trim().length === 0) {
      errors.zipCode = t('project.creationErrorZipCodeRequiredText')
      hasError = true
    } else if (!/^[1-9][0-9]{3}\s?(?!sa|sd|ss)[A-Za-z]{2}$/.test(projectData.zipCode.trim())) {
      errors.zipCode = t('project.creationErrorInvalidZipCodeText')
      hasError = true
    }
    
    if (!projectData.street || projectData.street.trim().length === 0) {
      errors.street = t('project.creationErrorStreetRequiredText')
      hasError = true
    }

    if (!projectData.houseNumber || projectData.houseNumber.trim().length === 0) {
      errors.houseNumber = t('project.creationErrorHouseNumberRequiredText')
      hasError = true
    } else if (!/^(\d+)([A-Za-z])?$/.test(projectData.houseNumber.trim())) {
      errors.houseNumber = t('project.creationErrorNumberNotDigitsText')
      hasError = true
    }

    return !hasError
  }

  function resetErrors() {
    Object.keys(errors).forEach((k) => (errors[k] = ''))
  }

  return {
    errors,
    // validity booleans
    isNameValid,
    isCityValid,
    isZipCodeValid,
    isStreetValid,
    isHouseNumberValid,
    // submit helpers
    validateAll,
    resetErrors
  }
}