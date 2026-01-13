import countryCodes from '@/data/countryCodes.json'

const ALL_DIAL_CODES = Object.values(countryCodes)
  .flatMap(country => country.phone || [])
  .filter(Boolean)
  .sort((a, b) => b.length - a.length)

export function splitPhoneNumber(fullNumber = '') {
  const trimmed = fullNumber.trim()

  if (!trimmed) {
    return { countryCode: '', localNumber: '' }
  }

  const dialCode = ALL_DIAL_CODES.find(code => trimmed.startsWith(code)) || ''
  const localNumber = dialCode ? trimmed.slice(dialCode.length).trim() : trimmed

  return { countryCode: dialCode, localNumber }
}

export function joinPhoneNumber(countryCode = '', localNumber = '') {
  const cc = (countryCode || '').trim()
  const ln = (localNumber || '').trim()

  if (!cc && !ln) return ''
  if (!cc) return ln
  if (!ln) return cc

  return `${cc}${ln.replace(/\s+/g, '')}`
}