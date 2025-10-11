// src/composables/useProjectLookup.js
import { ref } from 'vue'
import api from '@/services/api'

/**
 * Handles fetching projects and matching them by address.
 * WHY: Keeps all project-related logic independent from the form.
 */
export function useProjectLookup(ticketData) {
  const projects = ref([])

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
    try {
      const response = await api.get('/projects', { params })
      projects.value = response.data

      if (projects.value.length === 1) {
        ticketData.projectId = projects.value[0].id
      } else if (projects.value.length === 0) {
        ticketData.projectId = ''
      } else {
        const ids = projects.value.map(p => p.id)
        if (!ids.includes(ticketData.projectId)) ticketData.projectId = ''
      }
    } catch (error) {
      console.error('Error fetching projects by address:', error)
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
    autofillAddress
  }
}