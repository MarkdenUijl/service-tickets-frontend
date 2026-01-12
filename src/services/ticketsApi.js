import api from '@/services/api'

export async function fetchTickets({ range, query } = {}) {
  const params = {}

  if (range?.start) params.from = new Date(range.start).toISOString()
  if (range?.end) params.to = new Date(range.end).toISOString()
  if (query) params.q = query.trim()

  const { data } = await api.get('/serviceTickets', { params })
  return data
}


export function mergeTicketEvent(current, evt) {
  if (!evt) return current
  const list = [...current]

  switch (evt.type) {
    case 'CREATED': {
      const idx = list.findIndex(t => t.id === evt.ticket.id)
      if (idx === -1) list.unshift(evt.ticket)
      else list[idx] = evt.ticket
      break
    }
    case 'UPDATED': {
      const idx = list.findIndex(t => t.id === evt.ticket.id)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...evt.ticket }
      } else {
        list.unshift(evt.ticket)
      }
      break
    }
    case 'DELETED': {
      const id = evt.ticketId ?? evt.ticket?.id
      return list.filter(t => t.id !== id)
    }
    default:
      return current
  }

  return list
}