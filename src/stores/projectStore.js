import { fetchProjects, getProjectById, deleteProjectById, createProject } from '@/services/projectsApi'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProjectStore = defineStore('projects', () => {
  // ===============================
  // STATE
  // ===============================
  const projects = ref([])
  const selectedProject = ref(null)
  const loading = ref(false)
  const lastSync = ref(null)

  // ===============================
  // INTERNAL HELPERS
  // ===============================
  const normalizeProjectError = (error) => {
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

  const fetchById = async (id) => {
    loading.value = true

    try {
      const result = await getProjectById(id)
      selectedProject.value = result || null
      lastSync.value = new Date()
      return selectedProject.value
    } catch (e) {
      selectedProject.value = null
      throw normalizeProjectError(e)
    } finally {
      loading.value = false
    }
  }

  const create = async (payload) => {
    loading.value = true

    try {
      const result = await createProject(payload)

      // Keep local list in sync when possible
      if (result?.id) {
        projects.value = [result, ...(projects.value || [])]
      }

      lastSync.value = new Date()
      return result
    } catch (e) {
      throw normalizeProjectError(e)
    } finally {
      loading.value = false
    }
  }

  const removeById = async (id) => {
    loading.value = true
    
    try {
      await deleteProjectById(id)
      // Keep local list in sync without requiring a full refetch
      projects.value = (projects.value || []).filter((p) => p.id !== id)
      if (selectedProject.value?.id === id) selectedProject.value = null
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
    selectedProject.value = null
  }

  // ===============================
  // EXPORT INTERFACE
  // ===============================
  return {
    // state
    projects,
    selectedProject,
    loading,
    lastSync,

    // actions
    fetchAll,
    fetchById,
    create,
    removeById,
    clear,
  }
})