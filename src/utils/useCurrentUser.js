import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'


export function useCurrentUser() {
  const auth = useAuthStore()

  const user = computed(() => auth.user)

  const setUser = (newUser) => {
    auth.setUser({ user: newUser, token: auth.token })
  }

  return { user, setUser }
}