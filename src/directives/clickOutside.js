export default {
  beforeMount(el, binding) {
    if (typeof document === 'undefined') return

    // Only attach if value is a function
    if (typeof binding.value !== 'function') {
      console.warn('v-click-outside expects a function as the value')
      return
    }

    el.__clickOutsideHandler__ = (event) => {
      // Check if the click target is outside the element
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }

    // Use pointerdown to catch both mouse & touch early
    document.addEventListener('click', el.__clickOutsideHandler__)
  },
  unmounted(el) {
    if (el.__clickOutsideHandler__) {
      document.removeEventListener('click', el.__clickOutsideHandler__)
      delete el.__clickOutsideHandler__
    }
  }
}