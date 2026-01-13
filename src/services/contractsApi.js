import api from '@/services/api'

export async function fetchContracts({ range, query } = {}) {
  const params = {}

  const { data } = await api.get('/serviceContracts', { params })
  return data
}

export async function createContract(payload) {
  const { data } = await api.post('/serviceContracts', payload)
  return data
}

export async function updateContract(id, payload) {
  const { data } = await api.put(`/serviceContracts/${id}`, payload)
  return data
}

export async function renewContract(id, payload) {
  const { data } = await api.post(`/serviceContracts/${id}/renew`, payload)
  return data
}