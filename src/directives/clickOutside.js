export default {
  beforeMount(el, binding) {
    el.clickOutsideHandler = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    
    document.addEventListener("click", el.clickOutsideHandler);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideHandler);
  },
};