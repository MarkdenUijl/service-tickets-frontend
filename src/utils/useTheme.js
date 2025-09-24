import { useDark } from '@vueuse/core'

let isDarkRef = null

/**
 * useTheme
 *
 * Provides reactive theme state bound to `html` element classes via @vueuse/core/useDark.
 * WHY: Centralizes theme management (dark/light/auto) so any component can toggle or reset.
 */
export function useTheme() {
  if (!isDarkRef) {
    // Lazily create a singleton ref so all composables share the same theme state.
    isDarkRef = useDark({
      selector: 'html',
      attribute: 'class',
      valueDark: 'theme-dark',
      valueLight: 'theme-light',
      storageKey: 'theme',
      initialValue: 'auto' // WHY: follow system preference until user chooses explicitly
    })
  }

  // Toggle between dark/light manually
  const toggleTheme = () => {
    isDarkRef.value = !isDarkRef.value
  }

  // Reset to system default (removes stored preference)
  const resetToSystem = () => {
    localStorage.removeItem('theme')
    isDarkRef.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  return {
    isDark: isDarkRef,
    toggleTheme,
    resetToSystem
  }
}