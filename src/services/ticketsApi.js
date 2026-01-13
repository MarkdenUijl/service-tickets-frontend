import api from '@/services/api'

export async function fetchTickets({ range, query, params } = {}) {
  const finalParams = { ...(params || {}) }

  if (range?.start) finalParams.from = new Date(range.start).toISOString()
  if (range?.end) finalParams.to = new Date(range.end).toISOString()
  if (query) finalParams.q = query.trim()

  const { data } = await api.get('/serviceTickets', { params: finalParams })
  return data
}

export async function fetchTicketById(id) {
  const { data } = await api.get(`/serviceTickets/${id}`)
  return data
}

export function mergeTicketEvent(current, evt) {
  if (!evt) return current
  const list = [...current]

  switch (evt.type) {
    case 'CREATED': {
      const idx = list.findIndex((t) => t.id === evt.ticket.id)
      if (idx === -1) list.unshift(evt.ticket)
      else list[idx] = evt.ticket
      break
    }
    case 'UPDATED': {
      const idx = list.findIndex((t) => t.id === evt.ticket.id)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...evt.ticket }
      } else {
        list.unshift(evt.ticket)
      }
      break
    }
    case 'DELETED': {
      const idToRemove = evt.ticketId ?? evt.ticket?.id
      return list.filter((t) => t.id !== idToRemove)
    }
    default:
      return current
  }

  return list
}