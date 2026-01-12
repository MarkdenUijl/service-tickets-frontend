export function handleTicketUpdates(ticketDataRef) {
  return (update) => {
    if (!update || !ticketDataRef?.value) return

    if (update.responses) {
      ticketDataRef.value.responses = [...update.responses]
    }

    if (update.files) {
      ticketDataRef.value.files = { ...update.files }
    }

    if (update.status) {
      ticketDataRef.value.status = update.status
    }

    if (update.project) {
      ticketDataRef.value.project = { ...update.project }
    }
  }
}