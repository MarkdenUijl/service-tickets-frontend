// src/composables/useUserLookup.js
import { ref } from 'vue'
import api from '@/services/api'

/**
 * Handles fetching users and filtering by name or email.
 * WHY: Keeps user lookup modular and independent from the form.
 */
export function useUserLookup(ticketData) {
  const users = ref([])

  async function fetchUsers() {
    try {
      const response = await api.get('/users')
      users.value = response.data
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  function buildUserQueryParams() {
    const params = {}
    if (ticketData.firstName?.trim()) params.firstName = ticketData.firstName.trim()
    if (ticketData.lastName?.trim()) params.lastName = ticketData.lastName.trim()
    return params
  }

  async function fetchUsersByFilter() {
    const params = buildUserQueryParams()
    try {
      const response = await api.get('/users', { params })
      users.value = response.data

      // Auto-select logic like project lookup
      if (users.value.length === 1) {
        ticketData.submittedByUserId = users.value[0].id
      } else if (users.value.length === 0) {
        ticketData.submittedByUserId = null
      } else {
        const ids = users.value.map(u => u.id)
        if (!ids.includes(ticketData.submittedByUserId)) ticketData.submittedByUserId = null
      }

    } catch (error) {
      console.error('Error fetching users by filter:', error)
    }
  }

  /**
   * Autofills firstName and lastName fields in ticketData based on submittedByUserId.
   * If no user matches, clears both fields.
   */
  function autofillUserDetails(newUserId) {
    const user = users.value.find(u => u.id === newUserId)
    if (user) {
      ticketData.firstName = user.firstName || ''
      ticketData.lastName = user.lastName || ''
    } else {
      ticketData.firstName = ''
      ticketData.lastName = ''
    }
  }

  return {
    users,
    fetchUsers,
    fetchUsersByFilter,
    autofillUserDetails
  }
}