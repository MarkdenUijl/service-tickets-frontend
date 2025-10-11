import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

/**
 * Provides a reactive interface to the current user
 * through the centralized Pinia auth store.
 *
 * WHY:
 * - Keeps a single source of truth (Pinia) for user state.
 * - Still provides a simple composable interface for components.
 */
export function useCurrentUser() {
  const auth = useAuthStore()

  // Directly expose a computed reference to the user
  const user = computed(() => auth.user)

  // Allow updating user details via store
  const setUser = (newUser) => {
    auth.setUser({ user: newUser, token: auth.token })
  }

  return { user, setUser }
}