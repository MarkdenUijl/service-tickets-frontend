import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * useWindowSize
 *
 * Reactive wrapper around the current `window.innerWidth` and `window.innerHeight`.
 *
 * Why this exists
 * ---------------
 * - Provides reactivity: components can respond to window resize events without
 *   manually wiring event listeners.
 * - Encapsulates cleanup: listeners are registered/unregistered automatically
 *   with the component lifecycle.
 * - Useful for responsive behavior (e.g. DashboardDataTile hides menu options
 *   below a breakpoint).
 *
 * Returned
 * --------
 * `{ windowWidth, windowHeight }` — both are Vue refs that update on resize.
 */
export function useWindowSize() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0)
  const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 0)

  const updateSize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', updateSize, { passive: true })
    // In case window size changed between setup and mount
    updateSize()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateSize)
  })

  return {
    windowWidth,
    windowHeight
  }
}