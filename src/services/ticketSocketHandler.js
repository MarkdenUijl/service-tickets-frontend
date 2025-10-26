/**
 * Handles incoming WebSocket updates for a specific service ticket.
 * Keeps mutations in one place for clarity and reusability.
 * 
 * @param {Ref<Object>} ticketDataRef - Vue ref containing the current ticket data
 * @returns {Function} - callback to pass into connectToTicketDetail()
 */
export function handleTicketUpdates(ticketDataRef) {
  return (update) => {
    if (!update || !ticketDataRef?.value) return

    // Update ticket responses if changed
    if (update.responses) {
      ticketDataRef.value.responses = [...update.responses]
    }

    // Update attached files if changed
    if (update.files) {
      ticketDataRef.value.files = { ...update.files }
    }

    // Update ticket status if changed
    if (update.status) {
      ticketDataRef.value.status = update.status
    }

    // Optional: handle future update types cleanly
    if (update.project) {
      ticketDataRef.value.project = { ...update.project }
    }
  }
}