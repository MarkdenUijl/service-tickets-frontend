import api from '@/services/api'

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data?.token
}

export async function fetchMe() {
  const { data } = await api.get('/users/me')
  return data
}

export async function register(payload) {
  const { data } = await api.post('/users', payload)
  return data
}