import api from '@/services/api'

/**
 * Fetches tickets from the backend.
 * Accepts optional date range and search query filters.
 *
 * @param {Object} params
 * @param {{start: Date, end: Date}=} params.range
 * @param {string=} params.query
 * @returns {Promise<Array>} list of ticket DTOs
 */
export async function fetchTickets({ range, query } = {}) {
  const params = {}

  if (range?.start) params.from = new Date(range.start).toISOString()
  if (range?.end) params.to = new Date(range.end).toISOString()
  if (query) params.q = query.trim()

  const { data } = await api.get('/serviceTickets', { params })
  return data
}

/**
 * Pure helper that merges an incoming websocket event into an existing ticket list.
 * Keeps the mutation logic in one central place.
 *
 * @param {Array} current - current array of tickets
 * @param {Object} evt - websocket event { type, ticket, ticketId? }
 * @returns {Array} new tickets array
 */
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