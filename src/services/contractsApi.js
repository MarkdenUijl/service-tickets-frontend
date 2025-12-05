import api from '@/services/api'

export async function fetchContracts({ range, query } = {}) {
  const params = {}

  const { data } = await api.get('/serviceContracts', { params })
  return data
}