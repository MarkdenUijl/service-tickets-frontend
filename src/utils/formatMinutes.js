/**
 * Converts a total number of minutes into a localized human-readable string.
 * Example: 135 → "2 hours and 15 minutes" (translations handled via i18n)
 *
 * @param {number} minutes - The total number of minutes
 * @returns {string} A localized duration string
 */
import { useI18n } from 'vue-i18n'

export function formatMinutes(minutes) {
  const { t } = useI18n({ useScope: 'global' })

  if (!Number.isFinite(minutes) || minutes < 0) {
    return `0 ${t('base.minutesText')}`
  }

  const hrs = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)

  // Resolve correct plural labels
  const hourLabel = hrs === 1 ? t('base.hourText') : t('base.hoursText')
  const minuteLabel = t('base.minutesText')

  if (hrs > 0 && mins > 0) {
    return `${hrs} ${hourLabel} ${t('base.andText')} ${mins} ${minuteLabel}`
  }
  if (hrs > 0) return `${hrs} ${hourLabel}`
  return `${mins} ${minuteLabel}`
}