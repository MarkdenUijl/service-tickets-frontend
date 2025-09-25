/**
 * Check if a JWT in localStorage is present and not expired.
 *
 * WHY: This is a lightweight guard; it does not verify signature validity.
 * It simply checks expiry (`exp` claim) to decide if we should keep the token.
 */
export function isTokenValid() {
  const token = localStorage.getItem('token')

  if (!token) {
    logout()
    return false
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)

    if (payload.exp > currentTime) {
      return true
    } else {
      // WHY: Expired token is cleared immediately to avoid reuse.
      logout()
      return false
    }
  } catch {
    // WHY: If decoding fails, the token is likely malformed → clear it.
    logout()
    return false
  }
}

/**
 * Remove token + user from localStorage.
 * WHY: Keeps client storage clean when session ends.
 */
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}