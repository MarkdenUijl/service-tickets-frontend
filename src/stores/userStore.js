import { fetchUsers } from '@/services/usersApi'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('users', () => {
  // ===============================
  // STATE
  // ===============================
  const users = ref([])
  const loading = ref(false)
  const lastSync = ref(null)

  // ===============================
  // INTERNAL HELPERS
  // ===============================
  const normalizeUsersError = (error) => {
    const status = error?.response?.status

    if (status === 404) return { type: 'notFound', status }
    if (status === 400) return { type: 'badRequest', status }
    if (status === 401) return { type: 'unauthorized', status }

    // Your backend formats errors directly on the error object
    const uiMessageKey =
      (typeof error?.data === 'string' && error.data) ||
      (typeof error?.error === 'string' && error.error) ||
      (typeof error?.code === 'string' && error.code) ||
      null

    return { type: 'server', status, uiMessageKey, error }
  }

  // ===============================
  // ACTIONS
  // ===============================
  const fetchAll = async ({ params } = {}) => {
    loading.value = true
    try {
      const result = await fetchUsers({ params })
      users.value = Array.isArray(result) ? result : []
      lastSync.value = new Date()
    } catch (e) {
      throw normalizeUsersError(e)
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    users.value = []
    lastSync.value = null
  }

  // ===============================
  // EXPORT INTERFACE
  // ===============================
  return {
    // state
    users,
    loading,
    lastSync,

    // actions
    fetchAll,
    clear,
  }
})