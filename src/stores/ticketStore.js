import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchTickets, fetchTicketById, deleteTicketById, mergeTicketEvent } from '@/services/ticketsApi'

export const useTicketsStore = defineStore('tickets', () => {
  // ===============================
  // STATE
  // ===============================
  const tickets = ref([])
  const loading = ref(false)
  const lastSync = ref(null)

  // Ticket detail + related tickets
  const ticketData = ref(null)
  const recentUserTickets = ref([])
  const recentProjectTickets = ref([])

  // Dashboard filters
  const dateRange = ref(null)
  const searchQuery = ref('')

  // ===============================
  // INTERNAL HELPERS
  // ===============================
  const normalizeTicketsError = (error) => {
    const status = error?.response?.status

    if (status === 404) return { type: 'notFound', status }
    if (status === 400) return { type: 'badRequest', status }
    if (status === 401) return { type: 'unauthorized', status }

    const uiMessageKey =
      (typeof error?.data === 'string' && error.data) ||
      (typeof error?.error === 'string' && error.error) ||
      (typeof error?.code === 'string' && error.code) ||
      null

    return { type: 'server', status, uiMessageKey, error }
  }

  const clearTicketContext = () => {
    ticketData.value = null
    recentUserTickets.value = []
    recentProjectTickets.value = []
  }

  // ===============================
  // ACTIONS
  // ===============================
  const fetchAll = async () => {
    loading.value = true
    try {
      const result = await fetchTickets()
      tickets.value = Array.isArray(result) ? result : []
      lastSync.value = new Date()
    } catch (e) {
      throw normalizeTicketsError(e)
    } finally {
      loading.value = false
    }
  }

  const fetchById = async (id) => {
    loading.value = true
    try {
      const result = await fetchTicketById(id)
      ticketData.value = result || null
      return ticketData.value
    } catch (e) {
      clearTicketContext()
      throw normalizeTicketsError(e)
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    loading.value = true

    try {
      await deleteTicketById(id)

      // Keep local lists in sync
      tickets.value = (tickets.value || []).filter((t) => t.id !== id)

      if (ticketData.value?.id === id) {
        clearTicketContext()
      }

      // Also update related lists if present
      recentUserTickets.value = (recentUserTickets.value || []).filter((t) => t.id !== id)
      recentProjectTickets.value = (recentProjectTickets.value || []).filter((t) => t.id !== id)

      lastSync.value = new Date()
    } catch (e) {
      throw normalizeTicketsError(e)
    } finally {
      loading.value = false
    }
  }

  const fetchRecentForTicket = async (ticket) => {
    if (!ticket) {
      recentUserTickets.value = []
      recentProjectTickets.value = []
      return
    }

    const userId = ticket.submittedBy?.id
    const projectId = ticket.project?.id

    try {
      const [userList, projectList] = await Promise.all([
        userId
          ? fetchTickets({ params: { submitterId: userId, limit: 4, sort: 'desc' } })
          : Promise.resolve([]),
        projectId
          ? fetchTickets({ params: { projectId, limit: 4, sort: 'desc' } })
          : Promise.resolve([]),
      ])

      recentUserTickets.value = (userList || []).filter((t) => t.id !== ticket.id)
      recentProjectTickets.value = (projectList || []).filter((t) => t.id !== ticket.id)
    } catch (e) {
      // Don't hard-fail the page if related lookups fail; clear and rethrow so UI can decide.
      recentUserTickets.value = []
      recentProjectTickets.value = []
      throw normalizeTicketsError(e)
    }
  }

  const applyEvent = (evt) => {
    tickets.value = mergeTicketEvent(tickets.value, evt)

    if (ticketData.value && evt?.ticket?.id && ticketData.value.id === evt.ticket.id) {
      ticketData.value = { ...ticketData.value, ...evt.ticket }
    }

    if (ticketData.value && evt?.type === 'DELETED') {
      const idToRemove = evt.ticketId ?? evt.ticket?.id
      if (idToRemove && ticketData.value.id === idToRemove) {
        clearTicketContext()
      }
    }
  }

  const setDateRange = (range) => {
    let start = null
    let end = null

    if (Array.isArray(range)) {
      ;[start, end] = range
    } else if (range && typeof range === 'object') {
      start = range.start
      end = range.end
    }

    if (!end) {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      end = today
    }

    dateRange.value = start || end ? { start, end } : null
  }

  const setSearchQuery = (query) => {
    searchQuery.value = (query || '').trim()
  }

  const clear = () => {
    tickets.value = []
    lastSync.value = null
    clearTicketContext()
  }

  // ===============================
  // GETTERS
  // ===============================
  const filteredTickets = computed(() => {
    let list = tickets.value

    // Date range filter
    if (dateRange.value && (dateRange.value.start || dateRange.value.end)) {
      const start = dateRange.value.start
        ? new Date(dateRange.value.start).setHours(0, 0, 0, 0)
        : -Infinity

      const end = new Date(dateRange.value.end).setHours(23, 59, 59, 999)

      list = list.filter((t) => {
        const created = new Date(t.creationDate || t.createdAt).getTime()
        return created >= start && created <= end
      })
    }

    // Search filter
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()

      list = list.filter(
        (t) => t.project?.name && t.project?.name.toLowerCase().includes(q)
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
    ticketData,
    recentUserTickets,
    recentProjectTickets,

    // actions
    fetchAll,
    fetchById,
    remove,
    fetchRecentForTicket,
    applyEvent,
    setDateRange,
    setSearchQuery,
    clear,

    // getters
    filteredTickets,
  }
})