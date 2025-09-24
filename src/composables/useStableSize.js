import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

/**
 * useStableSize(targetRef, delayOrOptions?)
 *
 * Detects when an element's size has "settled" (i.e., stopped changing) and
 * exposes a `ready` flag alongside the current `width` and `height`.
 *
 * Why this exists
 * ---------------
 * Charts and complex layouts often animate/rescale on mount or on container
 * changes. Rendering expensive children only *after* sizes stop changing avoids
 * layout thrash and needless re-renders. This composable gives you a simple
 * signal: `ready === true` once the element's size has remained stable for the
 * configured debounce window.
 *
 * Parameters
 * ----------
 * - targetRef: Ref<HTMLElement | null>
 * - delayOrOptions (optional):
 *   - number → treated as `settleDelay` (ms), for backward compatibility.
 *   - object → `{ settleDelay = 150, minWidth = 1, minHeight = 1, round = Math.round }`
 *
 * Returned
 * --------
 * `{ ready, width, height }` plus an optional `recomputeNow()` helper for
 * manual re-measure (not required for normal use).
 */
export function useStableSize(targetRef, delayOrOptions = 150) {
  // --- Options (backward compatible with numeric delay)
  const opts =
    typeof delayOrOptions === 'number'
      ? { settleDelay: delayOrOptions, minWidth: 1, minHeight: 1, round: Math.round }
      : {
          settleDelay: 150,
          minWidth: 1,
          minHeight: 1,
          round: Math.round,
          ...delayOrOptions
        }

  const ready = ref(false)
  const width = ref(0)
  const height = ref(0)

  /**
   * Internals
   */
  let ro = null /** @type {ResizeObserver | null} */
  let timer = null /** @type {number | null} */
  let winResizeHandler = null /** @type {(() => void) | null} */

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  const scheduleReady = () => {
    // Debounce: push out the `ready` flip each time size changes
    clearTimer()

    if (width.value >= opts.minWidth && height.value >= opts.minHeight) {
      timer = window.setTimeout(() => {
        ready.value = true
      }, opts.settleDelay)
    } else {
      // If size is effectively zero, we keep not-ready
      ready.value = false
    }
  }

  const measureFrom = (el) => {
    const rect = el.getBoundingClientRect()
    const w = opts.round(rect.width)
    const h = opts.round(rect.height)
    if (w !== width.value || h !== height.value) {
      width.value = w
      height.value = h
      ready.value = false
      scheduleReady()
    }
  }

  /**
   * Ensure a size listener exists for the current element.
   * If `ResizeObserver` is unavailable, fall back to a window `resize` handler
   * (coarse but better than nothing).
   */
  const ensureObserverFor = (el) => {
    // Modern path: ResizeObserver
    if ('ResizeObserver' in window) {
      if (!ro) {
        ro = new ResizeObserver((entries) => {
          // We only observe one element at a time here
          const entry = entries[0]
          if (!entry || !entry.contentRect) return
          const cr = entry.contentRect
          const w = opts.round(cr.width)
          const h = opts.round(cr.height)
          if (w !== width.value || h !== height.value) {
            width.value = w
            height.value = h
            ready.value = false
            scheduleReady()
          }
        })
      }
      ro.observe(el)
      return
    }

    // Fallback path: window resize
    if (!winResizeHandler) {
      winResizeHandler = () => {
        if (targetRef.value) {
          measureFrom(targetRef.value)
        }
      }
      window.addEventListener('resize', winResizeHandler)
    }
  }

  const disconnectObserver = (el) => {
    if (ro && el) ro.unobserve(el)
  }

  const teardown = () => {
    clearTimer()
    ro?.disconnect?.()
    ro = null
    if (winResizeHandler) {
      window.removeEventListener('resize', winResizeHandler)
      winResizeHandler = null
    }
  }

  /** Force a re-measure (rarely needed; provided for completeness). */
  const recomputeNow = () => {
    const el = targetRef.value
    if (!el) return
    measureFrom(el)
  }

  onMounted(() => {
    const el = targetRef.value
    if (!el) return
    ensureObserverFor(el)
    // Initialize immediately with the current size; debounced ready follows
    measureFrom(el)
  })

  onBeforeUnmount(() => {
    const el = targetRef.value
    if (el) disconnectObserver(el)
    teardown()
  })

  // React to element changes (e.g., v-if/v-show swaps, slot remounts)
  watch(
    () => targetRef.value,
    (el, prev) => {
      if (prev) disconnectObserver(prev)

      if (el) {
        ensureObserverFor(el)
        // Measure immediately on new element and restart debounce
        measureFrom(el)
      } else {
        // Element went away; mark not-ready and zero out dimensions
        clearTimer()
        ready.value = false
        width.value = 0
        height.value = 0
      }
    }
  )

  return { ready, width, height, recomputeNow }
}