
export const TICKET_TYPE_COLORS = {
  'Hardware': 'var(--color-highlight)',
  'Software': 'var(--color-first-complementary)',
  'Question': 'var(--color-second-complementary)',
  'Change': 'var(--color-third-complementary)',
  'Unknown': 'var(--color-secondary)'
}

export function getTicketTypeColor(type) {
  return TICKET_TYPE_COLORS[type] || TICKET_TYPE_COLORS['Unknown']
}