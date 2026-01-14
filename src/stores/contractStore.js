import { fetchContracts, createContract, updateContract, renewContract, deleteContract } from '@/services/contractsApi'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useContractStore = defineStore('contracts', () => {
  // ===============================
  // STATE
  // ===============================
  const contracts = ref([])
  const loading = ref(false)
  const lastSync = ref(null)

  // ===============================
  // INTERNAL HELPERS
  // ===============================
  const normalizeContractsError = (error) => {
    const status = error?.response?.status

    if (status === 404) return { type: 'notFound', status }
    if (status === 400) return { type: 'badRequest', status }
    if (status === 401) return { type: 'unauthorized', status }
    if (status === 409) return { type: 'conflict', status }

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
  const fetchAll = async () => {
    loading.value = true
    try {
      const result = await fetchContracts()
      contracts.value = Array.isArray(result) ? result : []
      lastSync.value = new Date()
    } catch (e) {
      throw normalizeContractsError(e)
    } finally {
      loading.value = false
    }
  }

  const create = async (payload) => {
    loading.value = true

    try {
      const result = await createContract(payload)
      lastSync.value = new Date()
      return result
    } catch (e) {
      throw normalizeContractsError(e)
    } finally {
      loading.value = false
    }
  }

  const update = async (id, payload) => {
    loading.value = true

    try {
      const result = await updateContract(id, payload)
      lastSync.value = new Date()
      return result
    } catch (e) {
      throw normalizeContractsError(e)
    } finally {
      loading.value = false
    }
  }

  const renew = async (id, payload) => {
    loading.value = true

    try {
      const result = await renewContract(id, payload)
      lastSync.value = new Date()
      return result
    } catch (e) {
      throw normalizeContractsError(e)
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    loading.value = true

    try {
      await deleteContract(id)
      lastSync.value = new Date()
    } catch (e) {
      throw normalizeContractsError(e)
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    contracts.value = []
    lastSync.value = null
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
    create,
    update,
    renew,
    remove,
    clear,
  }
})