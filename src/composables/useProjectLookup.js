import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/stores/projectStore'

export function useProjectLookup(ticketData) {
  const projectStore = useProjectStore()
  const { projects } = storeToRefs(projectStore)

  const hasNoProjectMatch = ref(false)

  function clearProjectsAndSelection() {
    projectStore.clear()
    ticketData.projectId = ''
  }

  async function fetchProjects() {
    try {
      await projectStore.fetchAll()
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  function buildProjectQueryParams() {
    const params = {}
    if (ticketData.street.trim()) params.street = ticketData.street.trim()
    if (/^\d+$/.test(ticketData.houseNumber.trim())) {
      params.houseNumber = Number(ticketData.houseNumber)
    }
    if (ticketData.zipCode.trim()) params.zipCode = ticketData.zipCode.trim()
    if (ticketData.city.trim()) params.city = ticketData.city.trim()
    return params
  }

  async function fetchProjectsByAddress() {
    const params = buildProjectQueryParams()

    if (Object.keys(params).length === 0) {
      hasNoProjectMatch.value = false
      await fetchProjects()
      return
    }

    try {
      hasNoProjectMatch.value = false

      await projectStore.fetchAll({ params })
      const list = projects.value || []

      if (list.length === 0) {
        clearProjectsAndSelection()
        hasNoProjectMatch.value = true
        return
      }

      if (list.length === 1) {
        ticketData.projectId = list[0].id
      } else {
        const ids = list.map((p) => p.id)
        if (!ids.includes(ticketData.projectId)) {
          ticketData.projectId = ''
        }
      }
    } catch (error) {
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
    const project = (projects.value || []).find((p) => p.id === newProjectId)

    if (project) {
      Object.assign(ticketData, {
        street: String(project.street || ''),
        houseNumber: String(project.houseNumber || ''),
        zipCode: String(project.zipCode || ''),
        city: String(project.city || ''),
      })
    } else {
      Object.assign(ticketData, {
        street: '',
        houseNumber: '',
        zipCode: '',
        city: '',
      })
    }
  }

  return {
    projects,
    fetchProjects,
    fetchProjectsByAddress,
    autofillAddress,
    hasNoProjectMatch,
  }
}