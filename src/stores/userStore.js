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
  // ACTIONS
  // ===============================
  const fetchAll = async () => {
    loading.value = true
    try {
      const result = await fetchUsers()
      users.value = result
      lastSync.value = new Date()
    } finally {
      loading.value = false
    }
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
  }
})