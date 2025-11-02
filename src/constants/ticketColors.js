/**
 * Central color mapping for ticket types and dashboard visuals.
 * Always use these keys everywhere (pills, charts, legends, etc.)
 */
export const TICKET_TYPE_COLORS = {
  'Hardware': 'var(--color-highlight)',
  'Software': 'var(--color-first-complementary)',
  'Question': 'var(--color-second-complementary)',
  'Change': 'var(--color-third-complementary)',
  'Unknown': 'var(--color-secondary)'
}

/**
 * Utility: Get color for a given ticket type, with safe fallback.
 */
export function getTicketTypeColor(type) {
  return TICKET_TYPE_COLORS[type] || TICKET_TYPE_COLORS['Unknown']
}