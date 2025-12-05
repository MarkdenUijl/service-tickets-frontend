<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { useI18n } from 'vue-i18n'
import { capitalizeWords } from '@/utils/capitalizeWords'
import { useRouter } from 'vue-router'
import { PRIVILEGES } from '@/constants/privileges'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { PROJECT_CONTRACTS } from '@/constants/projectConstants'

import RouteInfo from '@/components/common/RouteInfo.vue'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'
import PrivilegedDataTable from '@/components/graphic-items/PrivilegedDataTable.vue'
import SearchInput from '@/components/user-input/SearchInput.vue'
import api from '@/services/api'
import FilterPopout from '@/components/lists/FilterPopout.vue'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const hasPrivilege = auth.hasPrivilege

const searchInput = ref('')
const itemsSelected = ref([])
const loading = ref(false)
const projectStore = useProjectStore()
const buttonHover = ref(false)
const isFilterOpen = ref(false)

const selectedContractTypes = ref([...PROJECT_CONTRACTS])

const items = computed(() => projectStore.projects.map(normalizeProject))

const filteredItems = computed(() =>
  items.value.filter(
    project => 
      selectedContractTypes.value.includes(project.contractTypeValue)
  )
)

const columns = computed(() => {
  return [
    { text: t('project.columnProjectNameText'), value: 'name', sortable: true },
    { text: t('project.columnProjectCityText'), value: 'city', sortable: true },
    { text: t('project.columnProjectContractText'), value: 'contractTypeDisplay', sortable: true }
  ]
})

function normalizeProject(project) {
    // Compute contract type value and display
  const contractTypeValue = project.serviceContract?.type || 'NONE'
  
  let contractTypeDisplay = project.serviceContract 
  ? capitalizeWords(
      contractTypeValue
        .replaceAll('_', ' ')
        .toLowerCase()
    )
  : t('project.detailsContractNoneText')

  // Check for contract end date and expiration
  const contractEndDateStr = project.serviceContract?.endDate
  if (contractEndDateStr) {
    const contractEndDate = new Date(contractEndDateStr)
    const today = new Date();
    contractEndDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    if (contractEndDate < today) {
      contractTypeDisplay = t('ticket.detailsContractStatusExpiredText')
    }
  }

  return {
    ...project,
    contractTypeValue,
    contractTypeDisplay
  }
}

function handleFilterClick() {
  isFilterOpen.value = !isFilterOpen.value
}

const filterSections = reactive([
  {
    id: 'contractTypes',
    title: 'ContractTypes',
    isOpen: false,
    type: 'checkbox',
    options: PROJECT_CONTRACTS,
    model: selectedContractTypes
  }
])

async function deleteProject(projectId) {
  try {
    await api.delete(`/projects/${projectId}`)
  } catch (error) {
    console.log(error?.status || error)
  }
}

async function handleBulkDelete() {
  if (!itemsSelected.value.length) return
  for (const item of itemsSelected.value) {
    await deleteProject(item.id)
  }
  itemsSelected.value = []

  projectStore.fetchAll()
}

const onCreateProject = () => {
  router.push({ name: 'project-create' })
}

function onClickProjectRow(item) {
  if (hasPrivilege(PRIVILEGES.SEE_PROJECTS)) {
    router.push({ name: 'project-detail', params: { id: item.id } })
  } else {
    console.log(`You have no provileges to view this project`)
  }
}

onMounted(() => {
  projectStore.fetchAll()
})
</script>

<template>
  <div class="dashboard-view-wrapper">
    <div class="dashboard-header-items">
      <RouteInfo />

      <div class="dashboard-button-container" v-if="hasPrivilege(PRIVILEGES.MODIFY_PROJECTS)">
        <AnimatePresence>
          <motion.button
            v-if="itemsSelected.length > 0"
            class="dashboard-header-button"
            type="button"
            :disabled="loading"
            :aria-busy="loading ? 'true' : 'false'"
            @mouseenter="buttonHover = true"
            @mouseleave="buttonHover = false"
            :initial="{ opacity: 0, scale: 0.9 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.9 }"
            :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
            :whileHover="{ scale: 1.05 }"
            @click="handleBulkDelete"
          >
            <!-- Trashcan icon -->
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
            >
              <path
                d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path d="M9.5 11L10 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M14.5 11L14 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />

              <motion.g
                :initial="{ rotate: 0, transformOrigin: '12px 6px' }"
                :animate="buttonHover ? { rotate: -25, x: -4, y: -2 } : { rotate: 0 }"
                :exit="{ rotate: 0 }"
                :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
              >
                <path
                  d="M20.5001 6H3.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </motion.g>
            </svg>
            <span>{{ t('project.deleteProjectsText') }}</span>
          </motion.button>
        </AnimatePresence>

        <motion.button
          class="dashboard-header-button"
          type="button"
          :disabled="loading"
          :aria-busy="loading ? 'true' : 'false'"
          :transition="{ duration: 0.2 }"
          :whileHover="{ scale: 1.03 }"
          @click="onCreateProject"
        >
          <SvgIcon name="create-ticket-icon" width="20px" height="20px" />
          <span>{{ t('project.createProjectText') }}</span>
        </motion.button>
      </div>
    </div>

    <div class="project-layout">
      <div id="project-filter-bar">
        <button
          id="project-filter-button"
          type="button"
          :disabled="loading"
          :aria-busy="loading ? 'true' : 'false'"
          @click.stop="handleFilterClick"
        >
          <SvgIcon name="filter-icon" height="20px" width="20px" />
          <span>{{ t('base.filterButtonText') }}</span>
        </button>

        <SearchInput :placeholder="t('project.searchProjectText')" variant="inline" v-model="searchInput" />

        <FilterPopout
          v-model:isOpen="isFilterOpen"
          :sections="filterSections"
          namespace="project"
        />
      </div>

      <PrivilegedDataTable
        :headers="columns"
        :items="filteredItems"
        :search-value="searchInput"
        :rows-per-page="10"
        :theme-color="'var(--color-highlight)'"
        header-class-name="table-header"
        table-class-name="data-table"
        header-text-direction="center"
        body-text-direction="center"
        v-model:items-selected="itemsSelected"
        buttons-pagination
        @click-row="onClickProjectRow"
        :privilege-key="PRIVILEGES.MODIFY_PROJECTS"
      >
        <template #item-name="{ name }">
          <span class="project-name-indicator">{{ name }}</span>
        </template>

        <template #item-contractTypeDisplay="{ contractTypeDisplay }">
          <span class="project-contract-indicator">
              {{ contractTypeDisplay }}
          </span>
        </template>

        <template #empty-message>
          <span class="project-no-data">{{ t('project.noDataFoundText') }}</span>
        </template>
      </PrivilegedDataTable>
    </div>
  </div>
</template>

<style>
.project-layout {
  flex: 1;
  background-color: var(--color-menu-background);
  margin: 12px;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

#project-filter-bar {
  display: flex;
  flex-direction: row;
  overflow: visible;
  position: relative;
}

#project-filter-button {
  width: 120px;
  border-radius: 4px 0 0 4px;
  border: 1px solid var(--color-subtext);
  border-right: none;
  cursor: pointer;
  color: var(--color-text);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding-left: 12px;
}

#project-filter-button[disabled] {
  opacity: 0.6;
  cursor: default;
}

#project-filter-button span {
  font-size: 13px;
  font-weight: 700;
}

.project-name-indicator {
  font-weight: 700;
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-contract-indicator {
  color: var(--color-subtext);
  font-weight: 700;
}

.project-no-data {
  color: var(--color-text);
  font-style: italic;
}
</style>