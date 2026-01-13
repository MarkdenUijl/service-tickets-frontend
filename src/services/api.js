import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_URL = import.meta.env.VITE_BACKEND_URL

if (!API_URL) {
  console.warn('[api] VITE_BACKEND_URL is not set; axios will use relative URLs')
}

// Helper: normalize paths so public endpoint checks are robust
// - forces a leading '/'
// - removes trailing '/' (except for root)
const normalizePath = (path) => {
  if (!path) return '/'
  try {
    let p = String(path)
    if (!p.startsWith('/')) p = '/' + p
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
    return p
  } catch {
    return '/'
  }
}

const PUBLIC_PATHS = ['/auth/login'].map(normalizePath)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  withCredentials: true
})

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers ?? {}

    let isPublic = false

    try {
      const base = config.baseURL || API_URL || window.location.origin
      const u = new URL(config.url, base)
      const path = normalizePath(u.pathname)

      isPublic = PUBLIC_PATHS.includes(path)
    } catch {
      isPublic = false
    }

    if (!isPublic) {
      const auth = useAuthStore()
      const token = auth?.token
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token.trim()}`
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorType = 'unknown'
    const status = error?.response?.status ?? null

    if (error.code === 'ECONNABORTED') {
      errorType = 'timeout'
    } else if (error.response) {
      if (status === 401) {
        errorType = 'unauthorized'
      } else if (status >= 400 && status < 500) {
        errorType = 'client'
      } else if (status >= 500) {
        errorType = 'server'
      } else {
        errorType = 'http'
      }
    } else if (error.request) {
      errorType = 'network'
    }

    return Promise.reject({
      type: errorType,
      status,
      url: error?.config?.url,
      method: error?.config?.method,
      data: error?.response?.data,
      originalError: error
    })
  }
)

export default api