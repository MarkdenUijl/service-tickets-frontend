export function getUsedTimeColorClass(contract) {
  const remainingMinutes = contract.contractTime - contract.usedTime

  if (remainingMinutes > 180) {
    return 'used-time-safe'
  }

  if (remainingMinutes > 60) {
    return 'used-time-warning'
  }

  return 'used-time-critical'
}