import api from '@/services/api'

export async function fetchUsers({ range, query } = {}) {
  const params = {}

  const { data } = await api.get('/users', { params })
  return data
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload)
  return data
}
