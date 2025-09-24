import { onMounted, onUnmounted, reactive } from 'vue'

// Base shape for a user object when no data is present
const EMPTY_USER = {
  firstName: '',
  lastName: '',
  email: ''
}

/**
 * Reactive wrapper around the current user persisted in localStorage.
 *
 * WHY: Provides a single source of truth for user identity across the app.
 * - Keeps `user` reactive so components auto-update when storage changes.
 * - Synchronizes across browser tabs via the `storage` event.
 */
export function useCurrentUser() {
  const user = reactive({ ...EMPTY_USER })

  // Load user from localStorage or fall back to EMPTY_USER
  const loadUserFromStorage = () => {
    try {
      const raw = localStorage.getItem('user')
      const stored = raw ? JSON.parse(raw) : {}

      if (typeof stored.firstName === 'string') {
        Object.assign(user, stored)
      } else {
        Object.assign(user, EMPTY_USER)
      }
    } catch (error) {
      console.warn('[useCurrentUser] Failed to parse user from localStorage', error)
      Object.assign(user, EMPTY_USER)
    }
  }

  loadUserFromStorage()

  // Keep user in sync when `localStorage` changes in another tab
  const handleStorageChange = (e) => {
    if (e.key === 'user') loadUserFromStorage()
  }

  onMounted(() => window.addEventListener('storage', handleStorageChange))
  onUnmounted(() => window.removeEventListener('storage', handleStorageChange))

  // Update localStorage and reactive user
  const setUser = (newUser) => {
    try {
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch (error) {
      console.error('[useCurrentUser] Failed to store user in localStorage', error)
    }
    Object.assign(user, newUser)
  }

  return { user, setUser }
}