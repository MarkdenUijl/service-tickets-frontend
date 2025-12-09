import countryCodes from '@/data/countryCodes.json'

// Build a flat list of dial codes, longest first to avoid partial matches
const ALL_DIAL_CODES = Object.values(countryCodes)
  .flatMap(country => country.phone || [])
  .filter(Boolean)
  .sort((a, b) => b.length - a.length)

/**
 * Split a full phone number string into { countryCode, localNumber }
 * Example: "+31 6 12345678" → { countryCode: "+31", localNumber: "6 12345678" }
 */
export function splitPhoneNumber(fullNumber = '') {
  const trimmed = fullNumber.trim()

  if (!trimmed) {
    return { countryCode: '', localNumber: '' }
  }

  const dialCode = ALL_DIAL_CODES.find(code => trimmed.startsWith(code)) || ''
  const localNumber = dialCode ? trimmed.slice(dialCode.length).trim() : trimmed

  return { countryCode: dialCode, localNumber }
}

/**
 * Join countryCode + localNumber back into a single string for the backend
 */
export function joinPhoneNumber(countryCode = '', localNumber = '') {
  const cc = (countryCode || '').trim()
  const ln = (localNumber || '').trim()

  if (!cc && !ln) return ''
  if (!cc) return ln
  if (!ln) return cc

  // You can tweak this if you want to strip leading 0s, etc.
  return `${cc}${ln.replace(/\s+/g, '')}`
}