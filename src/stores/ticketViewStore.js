import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { TICKET_STATUSES, TICKET_TYPES, TICKET_PRIORITIES } from '@/constants/ticketConstants'

export const useTicketViewStore = defineStore('ticketView', () => {
  // --- Filter selections ---
  const selectedStatuses = ref([...TICKET_STATUSES.filter(s => s !== 'CLOSED')])
  const selectedTypes = ref([...TICKET_TYPES])
  const selectedPriorities = ref([...TICKET_PRIORITIES])

  // --- Sorting ---
  const sortBy = ref(['lastUpdated'])
  const sortType = ref(['desc'])

  // --- Load persisted state from localStorage on init ---
  const savedState = localStorage.getItem('ticketViewState')
  if (savedState) {
    const parsed = JSON.parse(savedState)
    selectedStatuses.value = parsed.selectedStatuses ?? selectedStatuses.value
    selectedTypes.value = parsed.selectedTypes ?? selectedTypes.value
    selectedPriorities.value = parsed.selectedPriorities ?? selectedPriorities.value
    sortBy.value = parsed.sortBy ?? sortBy.value
    sortType.value = parsed.sortType ?? sortType.value
  }

  // --- Persist state to localStorage whenever it changes ---
  watch(
    [selectedStatuses, selectedTypes, selectedPriorities, sortBy, sortType],
    () => {
      const stateToSave = {
        selectedStatuses: selectedStatuses.value,
        selectedTypes: selectedTypes.value,
        selectedPriorities: selectedPriorities.value,
        sortBy: sortBy.value,
        sortType: sortType.value
      }
      localStorage.setItem('ticketViewState', JSON.stringify(stateToSave))
    },
    { deep: true }
  )

  return {
    selectedStatuses,
    selectedTypes,
    selectedPriorities,
    sortBy,
    sortType
  }
})