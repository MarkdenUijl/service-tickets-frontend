import api from '@/services/api'

export async function fetchUsers({ params } = {}) {
  const { data } = await api.get('/users', { params: params || {} })
  return data
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload)
  return data
}

export async function deleteUserById(id) {
  await api.delete(`/users/${id}`)
}
