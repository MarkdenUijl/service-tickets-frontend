// src/composables/useTicketValidation.js
import { computed } from 'vue'

/**
 * Handles validation logic for ticket creation fields.
 * WHY: Keeps rules centralized and reusable (form or inline validation).
 */
export function useTicketValidation(ticketData) {
  const isNameValid = computed(() => ticketData.name.trim().length >= 10 || ticketData.name.length === 0)
  const isStreetValid = computed(() => ticketData.street.trim().length >= 0)
  const isHouseNumberValid = computed(() => /^\d+$/.test(ticketData.houseNumber.trim()) || ticketData.houseNumber.length === 0)
  const isZipCodeValid = computed(() => /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i.test(ticketData.zipCode.trim()) || ticketData.zipCode.length === 0)
  const isCityValid = computed(() => ticketData.city.trim().length >= 0)

  return {
    isNameValid,
    isStreetValid,
    isHouseNumberValid,
    isZipCodeValid,
    isCityValid
  }
}