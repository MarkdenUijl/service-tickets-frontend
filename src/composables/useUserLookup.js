// src/composables/useUserLookup.js
import { ref } from 'vue'
import api from '@/services/api'

/**
 * Handles fetching users and filtering by name or email.
 * WHY: Keeps user lookup modular and independent from the form.
 */
export function useUserLookup(ticketData) {
  const users = ref([])

  function clearUsersAndSelection() {
    users.value = []
    ticketData.submittedByUserId = null
  }

  // async function fetchUsers() {
  //   try {
  //     const response = await api.get('/users')
  //     users.value = response.data
  //   } catch (error) {
  //     console.error('Error fetching users:', error)
  //   }
  // }

  async function fetchUsers() {
    try {
      const response = await api.get('/users')
      users.value = response.data || []

      // Keep current selection only if it still exists
      if (ticketData.submittedByUserId) {
        const ids = users.value.map(u => u.id)
        if (!ids.includes(ticketData.submittedByUserId)) {
          ticketData.submittedByUserId = null
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      clearUsersAndSelection()
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

    // If there are no filters, go back to the default: full user list
    if (Object.keys(params).length === 0) {
      await fetchUsers()
      return
    }

    try {
      const response = await api.get('/users', { params })
      users.value = response.data || []

      if (users.value.length === 1) {
        // Single match → auto-select
        ticketData.submittedByUserId = users.value[0].id
      } else if (users.value.length === 0) {
        // No matches → clear selection
        ticketData.submittedByUserId = null
      } else {
        // Multiple matches → keep current selection only if it's still valid
        const ids = users.value.map(u => u.id)
        if (!ids.includes(ticketData.submittedByUserId)) {
          ticketData.submittedByUserId = null
        }
      }
    } catch (error) {
      console.error('Error fetching users by filter:', error)
      clearUsersAndSelection()
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