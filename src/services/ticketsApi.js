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

export async function deleteTicket(id) {
  await api.delete(`/serviceTickets/${id}`)
}

export async function createTicket(payload) {
  const { data } = await api.post('/serviceTickets', payload)
  return data
}

export async function uploadTicketFiles(ticketId, formData) {
  const { data } = await api.post(`/serviceTickets/${ticketId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function downloadTicketFile(ticketId, fileId) {
  // IMPORTANT: return full axios response so we can read headers (content-type)
  return api.get(`/serviceTickets/${ticketId}/files/${fileId}`, {
    responseType: 'blob',
  })
}

export async function deleteTicketFile(ticketId, fileId) {
  await api.delete(`/serviceTickets/${ticketId}/files/${fileId}`)
}

export async function updateTicketStatus(ticketId, status) {
  const { data } = await api.patch(`/serviceTickets/${ticketId}/status`, { status })
  return data
}

export async function createTicketResponse(payload) {
  const { data } = await api.post('/ticketResponses', payload)
  return data
}

export async function updateTicketDescription(ticketId, description) {
  const { data } = await api.patch(`/serviceTickets/${ticketId}`, {
    description,
  })
  return data
}

export async function updateTicketResponse(responseId, responseHtml) {
  const { data } = await api.patch(`/ticketResponses/${responseId}`, {
    response: responseHtml,
  })
  return data
}