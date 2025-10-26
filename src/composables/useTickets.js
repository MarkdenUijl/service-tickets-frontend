import { ref } from 'vue'
import api from '@/services/api'

export function useTickets() {
  const ticketData = ref(null)
  const recentUserTickets = ref([])
  const recentProjectTickets = ref([])

  async function fetchTicketById(id) {
    const res = await api.get(`/serviceTickets/${id}`)
    ticketData.value = res.data
    return ticketData.value
  }

  async function fetchRecentTickets(ticket) {
    if (!ticket) {
      recentUserTickets.value = []
      recentProjectTickets.value = []
      return
    }

    const userId = ticket.submittedBy?.id
    const projectId = ticket.project?.id

    const [userRes, projectRes] = await Promise.all([
      userId ? api.get(`/serviceTickets?submitterId=${userId}&limit=4&sort=desc`) : Promise.resolve({ data: [] }),
      projectId ? api.get(`/serviceTickets?projectId=${projectId}&limit=4&sort=desc`) : Promise.resolve({ data: [] })
    ])

    recentUserTickets.value = (userRes.data || []).filter(t => t.id !== ticket.id)
    recentProjectTickets.value = (projectRes.data || []).filter(t => t.id !== ticket.id)
  }

  return {
    ticketData,
    recentUserTickets,
    recentProjectTickets,
    fetchTicketById,
    fetchRecentTickets
  }
}