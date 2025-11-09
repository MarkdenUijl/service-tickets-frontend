import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchTickets, mergeTicketEvent } from '@/services/ticketsApi'

export const useTicketsStore = defineStore('tickets', () => {
  // ===============================
  // STATE
  // ===============================
  const tickets = ref([])
  const loading = ref(false)
  const lastSync = ref(null)

  // Dashboard filters
  const dateRange = ref(null)
  const searchQuery = ref('')

  // ===============================
  // ACTIONS
  // ===============================
  const fetchAll = async () => {
    loading.value = true
    try {
      const result = await fetchTickets()
      tickets.value = result
      lastSync.value = new Date()
    } finally {
      loading.value = false
    }
  }

  const applyEvent = (evt) => {
    tickets.value = mergeTicketEvent(tickets.value, evt)
  }

  const setDateRange = (range) => {
    if (Array.isArray(range)) {
      const [start, end] = range
      dateRange.value = { start, end }
    } else {
      dateRange.value = range || null
    }
  }

  const setSearchQuery = (query) => {
    searchQuery.value = (query || '').trim()
  }

  // ===============================
  // GETTERS
  // ===============================
  const filteredTickets = computed(() => {
    let list = tickets.value

    // Date range filter
    if (dateRange.value && (dateRange.value.start || dateRange.value.end)) {
      const start = dateRange.value.start ? new Date(dateRange.value.start).setHours(0, 0, 0, 0) : -Infinity
      const end = dateRange.value.end ? new Date(dateRange.value.end).setHours(23, 59, 59, 999) : Infinity

      list = list.filter(t => {
        const created = new Date(t.creationDate || t.createdAt).getTime()
        return created >= start && created <= end
      })
    }

    // Search filter
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.projectName && t.projectName.toLowerCase().includes(q)) ||
        (t.id && String(t.id).includes(q))
      )
    }

    return list
  })

  // ===============================
  // EXPORT INTERFACE
  // ===============================
  return {
    // state
    tickets,
    loading,
    lastSync,
    dateRange,
    searchQuery,

    // actions
    fetchAll,
    applyEvent,
    setDateRange,
    setSearchQuery,

    // getters
    filteredTickets
  }
})