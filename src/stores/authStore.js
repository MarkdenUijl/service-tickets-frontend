import { defineStore } from "pinia"
import { jwtDecode } from "jwt-decode"

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null
  }),
  actions: {
    setUser(userData) {
      this.user = userData.user,
      this.token = userData.token
    },
    logout() {
      this.user = null,
      this.token = null
    }
  },
  getters: {
    hasPrivilege: (state) => (privilege) => {
      if (!state.token) return false
      try {
        const decoded = jwtDecode(state.token)
        const privileges = decoded?.privileges
        
        if (!privileges || !Array.isArray(privileges)) return false
        return privileges.includes(privilege)
      } catch (e) {
        console.error(e)
        return false
      }
    }
  },
  persist: {
    paths: ['token', 'user']
  }
})