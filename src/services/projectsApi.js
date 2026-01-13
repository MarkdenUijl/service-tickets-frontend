import api from '@/services/api'

export async function fetchProjects({ params } = {}) {
  const { data } = await api.get('/projects', { params: params || {} })
  return data
}

export async function getProjectById(id) {
  const { data } = await api.get(`/projects/${ id }`)
  return data
}