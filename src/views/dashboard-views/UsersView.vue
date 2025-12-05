<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import RouteInfo from '@/components/common/RouteInfo.vue'
import { motion, AnimatePresence } from 'motion-v'
import { useI18n } from 'vue-i18n'
import { PRIVILEGES } from '@/constants/privileges'

import PrivilegedDataTable from '@/components/graphic-items/PrivilegedDataTable.vue'
import SearchInput from '@/components/user-input/SearchInput.vue'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'

const { t } = useI18n()

const searchInput = ref('')
const itemsSelected = ref([])
const loading = ref(false)
const buttonHover = ref(false)

const columns = computed(() => {
  return [
    { text: 'Project', value: 'projectName', sortable: true },
    { text: 'Type', value: 'type', sortable: true },
    { text: 'Start date', value: 'startDate', sortable: true },
    { text: 'End date', value: 'endDate', sortable: true },
    { text: 'Used time', value: 'usedTime', sortable: true }
  ]
})

const items = [
    {
        "id": 151,
        "contractTime": 360,
        "usedTime": 120,
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "projectName": "Delft Tech Park",
        "type": "FULL_TIME"
    },
    {
        "id": 201,
        "contractTime": 600,
        "usedTime": 200,
        "startDate": "2024-03-01",
        "endDate": "2025-02-28",
        "projectName": "Leiden BioCenter",
        "type": "OFFICE_HOURS"
    },
    {
        "id": 251,
        "contractTime": 720,
        "usedTime": 250,
        "startDate": "2023-07-01",
        "endDate": "2024-06-30",
        "projectName": "Arnhem Bridge Offices",
        "type": "FULL_TIME"
    },
    {
        "id": 351,
        "contractTime": 900,
        "usedTime": 100,
        "startDate": "2024-01-15",
        "endDate": "2025-01-15",
        "projectName": "Zwolle North",
        "type": "OFFICE_HOURS"
    },
    {
        "id": 401,
        "contractTime": 480,
        "usedTime": 100,
        "startDate": "2024-02-01",
        "endDate": "2025-01-31",
        "projectName": "Tilburg Centrum",
        "type": "OFFICE_HOURS"
    },
    {
        "id": 451,
        "contractTime": 240,
        "usedTime": 80,
        "startDate": "2024-06-01",
        "endDate": "2025-05-31",
        "projectName": "Breda Innovation Hub",
        "type": "FULL_TIME"
    },
    {
        "id": 501,
        "contractTime": 360,
        "usedTime": 40,
        "startDate": "2023-11-01",
        "endDate": "2024-10-31",
        "projectName": "Apeldoorn Campus",
        "type": "OFFICE_HOURS"
    },
    {
        "id": 301,
        "contractTime": 300,
        "usedTime": 71,
        "startDate": "2024-05-01",
        "endDate": "2025-04-30",
        "projectName": "Haarlem HQ",
        "type": "FULL_TIME"
    },
    {
        "id": 101,
        "contractTime": 480,
        "usedTime": 27,
        "startDate": "2023-01-01",
        "endDate": "2023-12-31",
        "projectName": "Groningen Central",
        "type": "OFFICE_HOURS"
    },
    {
        "id": 1,
        "contractTime": 480,
        "usedTime": 11,
        "startDate": "2023-01-01",
        "endDate": "2023-12-31",
        "projectName": "Amsterdam Tower",
        "type": "OFFICE_HOURS"
    },
    {
        "id": 601,
        "contractTime": 480,
        "usedTime": 160,
        "startDate": "2024-07-01",
        "endDate": "2025-06-30",
        "projectName": "Universiteit Delft",
        "type": "FULL_TIME"
    },
    {
        "id": 551,
        "contractTime": 600,
        "usedTime": 192,
        "startDate": "2024-04-01",
        "endDate": "2025-03-31",
        "projectName": "Tergooi",
        "type": "FULL_TIME"
    }
]

function onClickContractRow(item) {
  console.log(item)
}

async function handleBulkDelete() {
  if (!itemsSelected.value.length) return
  for (const item of itemsSelected.value) {
    // await deleteProject(item.id)

    console.log(item)
  }
  itemsSelected.value = []

  // projectStore.fetchAll()
}
</script>

<template>
  <div class="dashboard-view-wrapper">
    <div class="dashboard-header-items">
      <RouteInfo />

      <div class="dashboard-button-container">
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
  
          <!-- <motion.button
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
          </motion.button> -->
        </div>
    </div>

    <div class="contract-layout">
      <div id="contract-filter-bar">
        <SearchInput :placeholder="t('project.searchProjectText')" variant="standalone" v-model="searchInput" />
      </div>

      <PrivilegedDataTable
        :headers="columns"
        :items="items"
        :search-value="searchInput"
        :rows-per-page="10"
        :theme-color="'var(--color-highlight)'"
        header-class-name="table-header"
        table-class-name="data-table"
        header-text-direction="center"
        body-text-direction="center"
        v-model:items-selected="itemsSelected"
        buttons-pagination
        @click-row="onClickContractRow"
        :privilege-key="PRIVILEGES.MODIFY_CONTRACTS"
      >
        <!-- <template #item-name="{ name }">
          <span class="project-name-indicator">{{ name }}</span>
        </template>

        <template #item-contractTypeDisplay="{ contractTypeDisplay }">
          <span class="project-contract-indicator">
              {{ contractTypeDisplay }}
          </span>
        </template> -->

        <template #empty-message>
          <span class="ticket-no-data">{{ t('ticket.noDataFoundText') }}</span>
        </template>
      </PrivilegedDataTable>
    </div>
  </div>
</template>

<style>
.contract-layout {
  flex: 1;
  background-color: var(--color-menu-background);
  margin: 12px;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

#contract-filter-bar {
  display: flex;
  flex-direction: row;
  overflow: visible;
  position: relative;
}
</style>