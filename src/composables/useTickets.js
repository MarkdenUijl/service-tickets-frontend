import { storeToRefs } from 'pinia'
import { useTicketsStore } from '@/stores/ticketStore'

export function useTickets() {
  const ticketsStore = useTicketsStore()
  const { ticketData, recentUserTickets, recentProjectTickets } = storeToRefs(ticketsStore)

  async function fetchTicketById(id) {
    return ticketsStore.fetchById(id)
  }

  async function fetchRecentTickets(ticket) {
    return ticketsStore.fetchRecentForTicket(ticket)
  }

  return {
    ticketData,
    recentUserTickets,
    recentProjectTickets,
    fetchTicketById,
    fetchRecentTickets,
  }
}