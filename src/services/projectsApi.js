import api from '@/services/api'

export async function fetchProjects({ params } = {}) {
  const { data } = await api.get('/projects', { params: params || {} })
  return data
}

export async function getProjectById(id) {
  const { data } = await api.get(`/projects/${id}`)
  return data
}

export async function deleteProjectById(id) {
  await api.delete(`/projects/${id}`)
}

export async function createProject(payload) {
  const { data } = await api.post('/projects', payload)
  return data
}