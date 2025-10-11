import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

// Base URL for the backend. We read it at module load so the axios instance
// is configured once. If this is missing, we warn (non-fatal) so the app can
// still run with relative URLs in dev.
const API_URL = import.meta.env.VITE_BACKEND_URL
const auth = useAuthStore()

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

// Public, unauthenticated endpoints (exact path match after normalization).
// WHY: Keeps auth logic centralized and avoids leaking tokens to public routes.
const PUBLIC_PATHS = ['/auth/login', '/users'].map(normalizePath)

// Single axios instance so interceptors apply uniformly across the app.
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // WHY: Some backends rely on Accept for proper content negotiation
    Accept: 'application/json'
  },
  // WHY: Allow cookie-based features (CSRF/session) alongside token auth.
  // Server decides which auth mechanism to honor.
  withCredentials: true
  // NOTE: No global timeout here to avoid breaking long-running operations.
  // Callers can pass `timeout` per request if needed.
})

// REQUEST INTERCEPTOR
// - Adds Authorization header for non-public endpoints when a token exists.
// - Uses URL() so both relative and absolute `config.url` values are supported.
api.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    config.headers = config.headers ?? {}

    // Determine if the request targets a public path
    let isPublic = false
    try {
      const base = config.baseURL || API_URL || window.location.origin
      // If `config.url` is relative, new URL() resolves it against `base`.
      const u = new URL(config.url, base)
      const path = normalizePath(u.pathname)
      isPublic = PUBLIC_PATHS.includes(path)
    } catch {
      // If parsing fails, err on the side of adding auth (server will verify)
      isPublic = false
    }

    if (!isPublic) {
      const token = auth.token
      // WHY: Attach token only when present; otherwise let the backend 401.
      if (token) {
        config.headers['Authorization'] = `Bearer ${token.trim()}`
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR
// - Normalizes error objects so callers can branch on `type` reliably.
// - Preserves the original axios error under `originalError` for debugging.
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
      // Request was made but no response received (network down, CORS, etc.)
      errorType = 'network'
    }

    // IMPORTANT: Do not auto-redirect or clear tokens here. Keep this module
    // single‑responsibility; let views or a global error handler decide.
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