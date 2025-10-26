import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchTickets, mergeTicketEvent } from '@/services/ticketsApi'

export const useTicketsStore = defineStore('tickets', () => {
  const tickets = ref([])
  const loading = ref(false)
  const lastSync = ref(null)

  const activeRange = ref(null)   // { start: Date, end: Date } or null
  const searchQuery = ref('')

  const setFilters = ({ range, query }) => {
    activeRange.value = range || null
    searchQuery.value = (query || '').trim()
  }

  const fetchAll = async () => {
    loading.value = true
    try {
      const result = await fetchTickets({ range: activeRange.value, query: searchQuery.value })
      tickets.value = result
      lastSync.value = new Date()
    } finally {
      loading.value = false
    }
  }

  // Merge websocket events (created/updated/closed/etc.)
  const applyEvent = (evt) => {
    tickets.value = mergeTicketEvent(tickets.value, evt)
  }

  // Filtered tickets (date range + text query)
  const filteredTickets = computed(() => {
    let list = tickets.value

    if (activeRange.value?.start || activeRange.value?.end) {
      const startMs = activeRange.value?.start ? new Date(activeRange.value.start).getTime() : -Infinity
      const endMs   = activeRange.value?.end ? new Date(activeRange.value.end).getTime() + 24*60*60*1000 - 1 : Infinity
      list = list.filter(t => {
        const createdMs = new Date(t.createdAt).getTime()
        return createdMs >= startMs && createdMs <= endMs
      })
    }

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

  return {
    // state
    tickets, loading, lastSync,
    activeRange, searchQuery,

    // actions
    setFilters, fetchAll, applyEvent,

    // getters
    filteredTickets
  }
})