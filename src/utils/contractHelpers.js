import { formatMinutes } from './formatMinutes'
import { capitalizeWords } from './capitalizeWords'

export function isContractCurrentlyValid(contract) {
  if (!contract?.startDate || !contract?.endDate) return false
  const now = new Date()
  return now >= new Date(contract.startDate) && now <= new Date(contract.endDate)
}

export function getRemainingContractTime(contract) {
  if (!contract?.contractTime) return formatMinutes(0)
  const used = contract.usedTime || 0
  const remaining = Math.max(0, contract.contractTime - used)
  return formatMinutes(remaining)
}

export function getContractTypeKey(contract) {
  const type = contract?.type || 'none'
  return 'ticket.contract' + capitalizeWords(type).replaceAll('_', '') + 'Text'
}