import { formatMinutes } from '@/utils/formatMinutes'
import { capitalizeWords } from './capitalizeWords'

/**
 * Checks if a given service contract is currently valid based on start and end dates.
 * @param {Object} contract - The service contract object
 * @returns {Boolean}
 */
export function isContractCurrentlyValid(contract) {
  if (!contract?.startDate || !contract?.endDate) return false
  const now = new Date()
  return now >= new Date(contract.startDate) && now <= new Date(contract.endDate)
}

/**
 * Returns the formatted remaining time on a contract as a readable string (e.g., "3 hours 45 minutes").
 * @param {Object} contract
 * @returns {String}
 */
export function getRemainingContractTime(contract) {
  if (!contract?.contractTime) return formatMinutes(0)
  const used = contract.usedTime || 0
  const remaining = Math.max(0, contract.contractTime - used)
  return formatMinutes(remaining)
}

/**
 * Generates a localized contract type label key (for i18n lookup).
 * Example: "FULL_TIME" → "ticket.contractFullTimeText"
 * @param {Object} contract
 * @returns {String}
 */
export function getContractTypeKey(contract) {
  const type = contract?.type || 'none'
  return 'ticket.contract' + capitalizeWords(type).replaceAll('_', '') + 'Text'
}