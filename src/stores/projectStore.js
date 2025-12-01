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
  // ACTIONS
  // ===============================
  const fetchAll = async () => {
    loading.value = true
    try {
      const result = await fetchProjects()
      projects.value = result
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
    projects,
    loading,
    lastSync,

    // actions
    fetchAll,
  }
})