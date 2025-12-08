import { fetchContracts } from '@/services/contractsApi'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useContracttStore = defineStore('contracts', () => {
  // ===============================
  // STATE
  // ===============================
  const contracts = ref([])
  const loading = ref(false)
  const lastSync = ref(null)

  // ===============================
  // ACTIONS
  // ===============================
  const fetchAll = async () => {
    loading.value = true
    try {
      const result = await fetchContracts()
      contracts.value = result
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
    contracts,
    loading,
    lastSync,

    // actions
    fetchAll,
  }
})