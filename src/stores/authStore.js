import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { jwtDecode } from "jwt-decode"
import {
  login as apiLogin,
  fetchMe,
  register as apiRegister,
  setAuthToken,
} from "@/services/authApi"

export const useAuthStore = defineStore(
  "auth",
  () => {
    // ===============================
    // STATE
    // ===============================
    const user = ref(null)
    const token = ref(null)

    // ===============================
    // INTERNAL HELPERS
    // ===============================
    const normalizeAuthError = (error) => {
      const status = error?.status

      if (status === 401 || error?.type === "unauthorized") {
        return { type: "unauthorized", status }
      }

      if (status === 409 || error?.type === "conflict") {
        return { type: "conflict", status }
      }

      if (status === 400 || error?.type==="client") {
        return { type: "client", status }
      }

      // const serverData = error?.data
      const uiMessageKey =
        (typeof error?.data === "string" && error.data) ||
        (typeof error?.error === "string" && error.error) ||
        (typeof error?.code === "string" && error.code) ||
        null

      return { type: "server", status, uiMessageKey, error }
    }

    // ===============================
    // ACTIONS
    // ===============================
    const setUser = (userData) => {
      user.value = userData?.user ?? null
      token.value = userData?.token ?? null

      // Only the service should touch axios/api
      setAuthToken(token.value)
    }

    const login = async ({ email, password, tokenPersist } = {}) => {
      const payload = {
        username: (email || "").trim().toLowerCase(),
        password,
        tokenPersist: !!tokenPersist,
      }

      try {
        const newToken = await apiLogin(payload)
        if (!newToken) throw { type: "server", status: 0 }

        setAuthToken(newToken)

        const me = await fetchMe()
        setUser({ user: me, token: newToken })
      } catch (e) {
        setAuthToken(null)
        throw normalizeAuthError(e)
      }
    }

    const logout = () => {
      user.value = null
      token.value = null
    }

    const register = async (payload) => {
      try {
        await apiRegister(payload)
      } catch (e) {
        throw normalizeAuthError(e)
      }
    }

    // ===============================
    // GETTERS
    // ===============================
    const hasPrivilege = computed(() => (privilege) => {
      if (!token.value) return false

      try {
        const decoded = jwtDecode(token.value)
        const privileges = decoded?.privileges
        if (!privileges || !Array.isArray(privileges)) return false
        return privileges.includes(privilege)
      } catch (e) {
        console.error(e)
        return false
      }
    })

    return {
      user,
      token,
      setUser,
      login,
      register,
      logout,
      hasPrivilege,
    }
  },
  {
    persist: {
      paths: ["token", "user"],
    },
  }
)