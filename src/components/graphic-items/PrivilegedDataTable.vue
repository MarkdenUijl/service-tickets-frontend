<script setup>
import { computed } from 'vue'
import EasyDataTable from 'vue3-easy-data-table'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  headers: Array,
  items: Array,
  searchValue: String,
  sortBy: String,
  sortType: String,
  itemsSelected: Array,
  loading: Boolean,
  tableClassName: String,
  headerClassName: String,
  privilegeKey: {
    type: String,
    default: 'CAN_MODERATE_SERVICE_TICKETS_PRIVILEGE'
  }
})

const emit = defineEmits(['update:itemsSelected', 'click-row', 'update-sort'])

const auth = useAuthStore()
const hasPrivilege = auth.hasPrivilege

// Proxy selection (only active if user has privilege)
const itemsSelectedProxy = computed({
  get: () => (hasPrivilege(props.privilegeKey) ? props.itemsSelected : []),
  set: (value) => {
    if (hasPrivilege(props.privilegeKey)) {
      emit('update:itemsSelected', value)
    }
  }
})
</script>

<template>
  <!-- With privilege -->
  <EasyDataTable
    v-if="hasPrivilege(props.privilegeKey)"
    :headers="props.headers"
    :items="props.items"
    :search-value="props.searchValue"
    :sort-by="props.sortBy"
    :sort-type="props.sortType"
    :theme-color="'var(--color-highlight)'"
    :header-class-name="props.headerClassName"
    :table-class-name="props.tableClassName"
    header-text-direction="center"
    body-text-direction="center"
    buttons-pagination
    v-model:items-selected="itemsSelectedProxy"
    @click-row="$emit('click-row', $event)"
    @update-sort="$emit('update-sort', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </EasyDataTable>

  <!-- Without privilege -->
  <EasyDataTable
    v-else
    :headers="props.headers"
    :items="props.items"
    :search-value="props.searchValue"
    :sort-by="props.sortBy"
    :sort-type="props.sortType"
    :theme-color="'var(--color-highlight)'"
    :header-class-name="props.headerClassName"
    :table-class-name="props.tableClassName"
    header-text-direction="center"
    body-text-direction="center"
    buttons-pagination
    @click-row="$emit('click-row', $event)"
    @update-sort="$emit('update-sort', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </EasyDataTable>
</template>