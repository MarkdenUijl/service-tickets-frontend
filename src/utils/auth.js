import { useAuthStore } from "@/stores/authStore"

/**
 * Check if a JWT in the Pinia auth store is present and not expired.
 *
 * WHY: This is a lightweight guard; it does not verify signature validity.
 * It simply checks expiry (`exp` claim) to decide if we should keep the token.
 */
export function isTokenValid() {
  const auth = useAuthStore()
  const token = auth.token

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
      logout()
      return false
    }
  } catch {
    logout()
    return false
  }
}

export function logout() {
  const auth = useAuthStore()
  auth.logout()
}