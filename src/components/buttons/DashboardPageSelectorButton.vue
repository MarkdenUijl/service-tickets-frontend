<script setup>
import SvgIcon from '../svg-icon/SvgIcon.vue'

const props = defineProps({
  selected: { type: Boolean, default: false },
  icon: { type: String, required: true },
  label: { type: String, required: true },
  to: { type: String, required: true }
})
</script>

<template>
    <router-link
        :to="props.to"
        :class="{
                'dashboard-menu-selector': true,
                'dashboard-menu-selector--selected': props.selected
            }"
    >
        <SvgIcon :name="props.icon" width="32px" height="32px" />
        <span>{{ props.label }}</span>
    </router-link>
</template>


<style scoped>
.dashboard-menu-selector {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;

  color: var(--color-subtext);

  cursor: pointer;
  text-decoration: none;
  padding-left: 36px;
}

.dashboard-menu-selector span {
  color: var(--color-subtext);
  font-family: 'Noto Sans JP';
  font-weight: bold;
  font-size: 20px;
}

.dashboard-menu-selector--selected {
  color: var(--color-highlight);
}

.dashboard-menu-selector--selected span {
  color: var(--color-text);
}
</style>
