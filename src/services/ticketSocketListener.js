import { connectToTickets, disconnectFromTickets } from '@/services/websocket'
import { useTicketsStore } from '@/stores/ticketStore'

export function initTicketSocketListener() {
  const store = useTicketsStore()

  const unsubscribe = connectToTickets((data) => {
    let evt

    if (data && data.type) {
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