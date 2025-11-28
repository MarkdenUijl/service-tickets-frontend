import { ref } from 'vue'
import api from '@/services/api'

/**
 * Handles fetching projects and matching them by address.
 * WHY: Keeps all project-related logic independent from the form.
 */
export function useProjectLookup(ticketData) {
  const projects = ref([])
  const hasNoProjectMatch = ref(false)

  function clearProjectsAndSelection() {
    projects.value = []
    ticketData.projectId = ''
  }

  async function fetchProjects() {
    try {
      const response = await api.get('/projects')
      projects.value = response.data
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  function buildProjectQueryParams() {
    const params = {}
    if (ticketData.street.trim()) params.street = ticketData.street.trim()
    if (/^\\d+$/.test(ticketData.houseNumber.trim())) params.houseNumber = Number(ticketData.houseNumber)
    if (ticketData.zipCode.trim()) params.zipCode = ticketData.zipCode.trim()
    if (ticketData.city.trim()) params.city = ticketData.city.trim()
    return params
  }

  async function fetchProjectsByAddress() {
    const params = buildProjectQueryParams()

    // If there is no address info, go back to the default: show all projects
    if (Object.keys(params).length === 0) {
      hasNoProjectMatch.value = false
      await fetchProjects()

      return
    }

    try {
      // reset previous state
      hasNoProjectMatch.value = false

      const response = await api.get('/projects', { params })
      projects.value = response.data || []

      if (projects.value.length === 0) {
        // No matches -> empty dropdown + flag
        clearProjectsAndSelection()
        hasNoProjectMatch.value = true
        return
      }

      // We *do* have matches -> normal behaviour
      if (projects.value.length === 1) {
        ticketData.projectId = projects.value[0].id
      } else {
        const ids = projects.value.map(p => p.id)
        if (!ids.includes(ticketData.projectId)) {
          ticketData.projectId = ''
        }
      }
    } catch (error) {
      // Treat 404 as "no matches", everything else as a real error
      const status = error?.status || error?.response?.status

      if (status === 404) {
        clearProjectsAndSelection()
        hasNoProjectMatch.value = true
      } else {
        console.error('Error fetching projects by address:', error)
        clearProjectsAndSelection()
        hasNoProjectMatch.value = false
      }
    }
  }

  function autofillAddress(newProjectId) {
    const project = projects.value.find(p => p.id === newProjectId)
    if (project) {
      Object.assign(ticketData, {
        street: String(project.street || ''),
        houseNumber: String(project.houseNumber || ''),
        zipCode: String(project.zipCode || ''),
        city: String(project.city || '')
      })
    } else {
      Object.assign(ticketData, {
        street: '',
        houseNumber: '',
        zipCode: '',
        city: ''
      })
    }
  }

  return {
    projects,
    fetchProjects,
    fetchProjectsByAddress,
    autofillAddress,
    hasNoProjectMatch
  }
}