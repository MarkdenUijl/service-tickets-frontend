import { connectToTickets, disconnectFromTickets } from '@/services/websocket'
import { useTicketsStore } from '@/stores/ticketStore'

/**
 * Initializes the main ticket websocket feed.
 * Subscribes to /topic/tickets and forwards events to the tickets store.
 * Normalizes the event shape if necessary.
 */
export function initTicketSocketListener() {
  const store = useTicketsStore()

  const unsubscribe = connectToTickets((data) => {
    // Some servers send { type, ticket }, others send the raw ticket object.
    let evt

    if (data && data.type) {
      // Already in correct format
      evt = data
    } else {
      console.warn('[ticketsSocketListener] Unknown event format:', data)
      return
    }

    store.applyEvent(evt)
  })

  return () => {
    disconnectFromTickets()
    if (typeof unsubscribe === 'function') unsubscribe()
  }
}