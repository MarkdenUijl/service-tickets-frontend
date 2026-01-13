import { reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export function useTicketValidation(ticketData) {
  const { t } = useI18n()
  const MAX_CHARS = 5000;

  const errors = reactive({
    name: '',
    type: '',
    description: '',
    projectId: '',
    street: '',
    houseNumber: '',
    zipCode: '',
    city: ''
  })

  const isNameValid = computed(() => ticketData.name.trim().length >= 10 || ticketData.name.length === 0)
  const isDescriptionValid = computed(() => {
    const rawLen = ticketData.description.length
    const trimmedLen = ticketData.description.trim().length
    return rawLen === 0 || (trimmedLen >= 10 && rawLen <= MAX_CHARS)
  })
  const isStreetValid = computed(() => ticketData.street.trim().length > 0 || ticketData.street.length === 0)
  const isHouseNumberValid = computed(() => /^(\d+)([A-Za-z])?$/.test(ticketData.houseNumber.trim()) || ticketData.houseNumber.length === 0)
  const isZipCodeValid = computed(() => /^[1-9][0-9]{3}\s?(?!sa|sd|ss)[A-Za-z]{2}$/.test(ticketData.zipCode.trim()) || ticketData.zipCode.length === 0)
  const isCityValid = computed(() => ticketData.city.trim().length > 0 || ticketData.city.length === 0)

  watch(() => ticketData.name, (val) => {
    if (val.length === 0) errors.name = ''
    else if (val.trim().length < 10) errors.name = t('ticket.creationErrorNameShortText')
    else errors.name = ''
  })

  watch(() => ticketData.type, (val) => {
    if (val) errors.type = ''
  })

  watch(() => ticketData.description, (val) => {
    if (val.length === 0) {
      errors.description = ''
    } else if (val.length > MAX_CHARS) {
      errors.description = t('ticket.creationErrorDescriptionTooLongText', { max: MAX_CHARS })
    } else if (val.trim().length < 10) {
      errors.description = t('ticket.creationErrorDescriptionShortText')
    } else {
      errors.description = ''
    }
  })

  watch(() => ticketData.projectId, (val) => {
    if (val) errors.projectId = ''
  })

  watch(() => ticketData.street, (val) => {
    errors.street = val.length === 0 ? '' : (val.trim().length > 0 ? '' : t('ticket.creationErrorStreetRequiredText'))
  })

  watch(() => ticketData.houseNumber, (val) => {
    if (val.length === 0) errors.houseNumber = ''
    else if (!/^(\d+)([A-Za-z])?$/.test(val.trim())) errors.houseNumber = t('ticket.creationErrorNumberNotDigitsText')
    else errors.houseNumber = ''
  })

  watch(() => ticketData.zipCode, (val) => {
    if (val.length === 0) errors.zipCode = ''
    else if (!/^[1-9][0-9]{3}\s?(?!sa|sd|ss)[A-Za-z]{2}$/.test(val.trim())) errors.zipCode = t('ticket.creationErrorInvalidZipCodeText')
    else errors.zipCode = ''
  })

  watch(() => ticketData.city, (val) => {
    errors.city = val.length === 0 ? '' : (val.trim().length > 0 ? '' : t('ticket.creationErrorCityRequiredText'))
  })

  function validateAll() {
    let hasError = false

    if (!ticketData.name || ticketData.name.trim().length === 0) {
      errors.name = t('ticket.creationErrorNameRequiredText')
      hasError = true
    } else if (ticketData.name.trim().length < 10) {
      errors.name = t('ticket.creationErrorNameShortText')
      hasError = true
    }

    if (!ticketData.type) {
      errors.type = t('ticket.creationErrorSelectTypeText')
      hasError = true
    } else {
      errors.type = ''
    }

    if (!ticketData.description || ticketData.description.trim().length === 0) {
      errors.description = t('ticket.creationErrorDescriptionRequiredText')
      hasError = true
    } else if (ticketData.description.trim().length < 10) {
      errors.description = t('ticket.creationErrorDescriptionShortText')
      hasError = true
    } else if (ticketData.description.length > MAX_CHARS) {
      errors.description = t('ticket.creationErrorDescriptionTooLongText', { max: MAX_CHARS })
      hasError = true
    }

    if (!ticketData.projectId) {
      errors.projectId = t('ticket.creationErrorProjectRequiredText')
      hasError = true
    } else {
      errors.projectId = ''
    }

    if (!ticketData.street || ticketData.street.trim().length === 0) {
      errors.street = t('ticket.creationErrorStreetRequiredText')
      hasError = true
    }

    if (!ticketData.houseNumber || ticketData.houseNumber.trim().length === 0) {
      errors.houseNumber = t('ticket.creationErrorHoudeNumberRequiredText')
      hasError = true
    } else if (!/^(\d+)([A-Za-z])?$/.test(ticketData.houseNumber.trim())) {
      errors.houseNumber = t('ticket.creationErrorNumberNotDigitsText')
      hasError = true
    }

    if (!ticketData.zipCode || ticketData.zipCode.trim().length === 0) {
      errors.zipCode = t('ticket.creationErrorZipCodeRequiredText')
      hasError = true
    } else if (!/^[1-9][0-9]{3}\s?(?!sa|sd|ss)[A-Za-z]{2}$/.test(ticketData.zipCode.trim())) {
      errors.zipCode = t('ticket.creationErrorInvalidZipCodeText')
      hasError = true
    }

    if (!ticketData.city || ticketData.city.trim().length === 0) {
      errors.city = t('ticket.creationErrorCityRequiredText')
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
    isDescriptionValid,
    isStreetValid,
    isHouseNumberValid,
    isZipCodeValid,
    isCityValid,
    // submit helpers
    validateAll,
    resetErrors
  }
}