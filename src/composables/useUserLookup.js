import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'

export function useUserLookup(ticketData) {
  const userStore = useUserStore()
  const { users } = storeToRefs(userStore)

  const hasNoUserMatch = ref(false)

  function clearUsersAndSelection() {
    userStore.clear()
    ticketData.submittedByUserId = null
  }

  async function fetchUsers() {
    try {
      hasNoUserMatch.value = false
      await userStore.fetchAll()

      // Keep current selection only if it still exists
      if (ticketData.submittedByUserId) {
        const ids = (users.value || []).map((u) => u.id)
        if (!ids.includes(ticketData.submittedByUserId)) {
          ticketData.submittedByUserId = null
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      clearUsersAndSelection()
      hasNoUserMatch.value = false
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

    if (Object.keys(params).length === 0) {
      await fetchUsers()
      return
    }

    try {
      hasNoUserMatch.value = false

      await userStore.fetchAll({ params })
      const list = users.value || []

      if (list.length === 1) {
        ticketData.submittedByUserId = list[0].id
      } else if (list.length === 0) {
        clearUsersAndSelection()
        hasNoUserMatch.value = true
      } else {
        const ids = list.map((u) => u.id)
        if (!ids.includes(ticketData.submittedByUserId)) {
          ticketData.submittedByUserId = null
        }
      }
    } catch (error) {
      console.error('Error fetching users by filter:', error)
      clearUsersAndSelection()
      hasNoUserMatch.value = false
    }
  }

  function autofillUserDetails(newUserId) {
    const user = (users.value || []).find((u) => u.id === newUserId)
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
    autofillUserDetails,
    hasNoUserMatch,
  }
}