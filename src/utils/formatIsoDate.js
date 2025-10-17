export function formatIsoDate(isoValue) {
  if (!isoValue) return { date: '—', time: '' }

  // Ensure we’re always dealing with a string
  const isoString = typeof isoValue === 'string' ? isoValue : String(isoValue)

  const dateObj = new Date(isoString)
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date format:', isoString)
    return { date: 'Invalid', time: '' }
  }

  const options = { month: 'short', day: 'numeric', year: 'numeric' }
  const date = dateObj.toLocaleDateString('nl-NL', options)
  const time = dateObj.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return { date, time }
}