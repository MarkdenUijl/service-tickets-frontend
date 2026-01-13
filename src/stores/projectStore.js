import { fetchProjects } from '@/services/projectsApi'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProjectStore = defineStore('projects', () => {
  // ===============================
  // STATE
  // ===============================
  const projects = ref([])
  const loading = ref(false)
  const lastSync = ref(null)

  // ===============================
  // INTERNAL HELPERS
  // ===============================
  const normalizeProjectError = (error) => {
    const status = error?.status

    if (status === 404) return { type: 'notFound', status }
    if (status === 400) return { type: 'badRequest', status }
    if (status === 401) return { type: 'unauthorized', status }

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
      const result = await fetchProjects({ params })
      projects.value = Array.isArray(result) ? result : []
      lastSync.value = new Date()
    } catch (e) {
      throw normalizeProjectError(e)
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    projects.value = []
    lastSync.value = null
  }

  // ===============================
  // EXPORT INTERFACE
  // ===============================
  return {
    // state
    projects,
    loading,
    lastSync,

    // actions
    fetchAll,
    clear,
  }
})