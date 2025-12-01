import api from '@/services/api'

export async function fetchProjects({ range, query } = {}) {
  const params = {}

  const { data } = await api.get('/projects', { params })
  return data
}