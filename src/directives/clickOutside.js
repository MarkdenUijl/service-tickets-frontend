export default {
  beforeMount(el, binding) {
    if (typeof document === 'undefined') return

    if (typeof binding.value !== 'function') {
      console.warn('v-click-outside expects a function as the value')
      return
    }

    el.__clickOutsideHandler__ = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }

    document.addEventListener('click', el.__clickOutsideHandler__)
  },
  unmounted(el) {
    if (el.__clickOutsideHandler__) {
      document.removeEventListener('click', el.__clickOutsideHandler__)
      delete el.__clickOutsideHandler__
    }
  }
}