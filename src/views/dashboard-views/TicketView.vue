<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { motion, AnimatePresence } from 'motion-v'
import { useRouter } from 'vue-router'

import RouteInfo from '@/components/common/RouteInfo.vue'
import SearchInput from '@/components/user-input/SearchInput.vue'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'

import api from '@/services/api'
import { useTicketsStore } from '@/stores/ticketStore'
import { capitalizeWords } from '@/utils/capitalizeWords'
import { formatIsoDate } from '@/utils/formatIsoDate'
import { TICKET_STATUSES, TICKET_TYPES, PRIORITY_ORDER, TICKET_PRIORITIES } from '@/constants/ticketConstants'
import TicketStatusPill from '@/components/graphic-items/TicketStatusPill.vue'
import TicketTypePill from '@/components/graphic-items/TicketTypePill.vue'
import TicketPriorityPill from '@/components/graphic-items/TicketPriorityPill.vue'
import PrivilegedDataTable from '@/components/graphic-items/PrivilegedDataTable.vue'

const router = useRouter();

const loading = ref(false)
const searchInput = ref('')
const ticketsStore = useTicketsStore()
const itemsSelected = ref([])
const buttonHover = ref(false)

const sortBy = ref(['priorityValue', 'lastUpdated'])
const sortType = ref(['desc', 'desc'])
const isFilterOpen = ref(false)
const selectedStatuses = ref([...TICKET_STATUSES.filter(s => s !== 'CLOSED')])
const selectedTypes = ref([...TICKET_TYPES])
const selectedPriorities = ref([...TICKET_PRIORITIES])

const { t, locale } = useI18n()

const filterSections = reactive([
  {
    id: 'status',
    title: 'STATUS',
    isOpen: false,
    type: 'checkbox',
    options: TICKET_STATUSES,
    model: selectedStatuses
  },
  {
    id: 'type',
    title: 'TYPE',
    isOpen: false,
    type: 'checkbox',
    options: TICKET_TYPES,
    model: selectedTypes
  },
  {
    id: 'priority',
    title: 'PRIORITY',
    isOpen: false,
    type: 'checkbox',
    options: TICKET_PRIORITIES,
    model: selectedPriorities
  }
])

const toggleFilterSection = (section) => {
  section.isOpen = !section.isOpen
}

const onClickOutside = () => {
  if (!isFilterOpen.value) return
  isFilterOpen.value = false
}

const items = computed(() => ticketsStore.filteredTickets.map(normalizeTicket))

const filteredItems = computed(() =>
  items.value.filter(
    ticket =>
      selectedStatuses.value.includes(ticket.status) &&
      selectedTypes.value.includes(ticket.type) &&
      selectedPriorities.value.includes(ticket.priority)
  )
)

const columns = computed(() => {
  locale.value
  return [
    { text: t('ticket.columnPriorityText'), value: 'priorityValue', sortable: true },
    { text: t('ticket.columnTicketTitleText'), value: 'name' },
    { text: t('ticket.columnTypeText'), value: 'type', sortable: true },
    { text: t('ticket.columnCallTimeText'), value: 'creationDate', sortable: true },
    { text: t('ticket.columnProjectTitleText'), value: 'projectName', sortable: true },
    { text: t('ticket.columnContractTypeText'), value: 'contractTypeValue', sortable: true },
    { text: t('ticket.columnLastUpdatedText'), value: 'lastUpdated', sortable: true },
    { text: t('ticket.columnStatusText'), value: 'status', sortable: true }
  ]
})

// Normalize a raw ticket from API/websocket into table-ready form.
function normalizeTicket(ticket) {
    // Compute contract type value and display
  const contractTypeValue = ticket.project?.serviceContract?.type || 'NONE';
  let contractTypeDisplay = capitalizeWords(
    contractTypeValue
      .replaceAll('_', ' ')
      .toLowerCase()
  );

  // Check for contract end date and expiration
  const contractEndDateStr = ticket.project?.serviceContract?.endDate
  if (contractEndDateStr) {
    const contractEndDate = new Date(contractEndDateStr)
    const today = new Date();
    contractEndDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    if (contractEndDate < today) {
      contractTypeDisplay = t('ticket.detailsContractStatusExpiredText')
    }
  }

  const priorityValue = PRIORITY_ORDER[ticket.priority] || 0;

  return {
    ...ticket,
    projectName: ticket.project?.name || '',
    contractTypeValue,
    contractTypeDisplay,
    priority: ticket.priority,
    priorityValue,
    lastUpdated: ticket.lastUpdated
  }
}

async function deleteTicket(ticketId) {
  try {
    await api.delete(`/serviceTickets/${ticketId}`)
  } catch (error) {
    console.log(error?.status || error)
  }
}

function handleFilterClick() {
  isFilterOpen.value = !isFilterOpen.value
}

async function handleBulkDelete() {
  if (!itemsSelected.value.length) return
  for (const item of itemsSelected.value) {
    await deleteTicket(item.id)
  }
  itemsSelected.value = []
}

function onClickTicketRow(item) {
  console.log(item)
  router.push({ name: 'ticket-detail', params: { id: item.id } });
}

function onUpdateSort(sortOptions) {
  const clickedColumn = sortOptions.sortBy;
  const clickedType = sortOptions.sortType;

  // Copy current arrays
  let newSortBy = [...sortBy.value];
  let newSortType = [...sortType.value];

  // Find existing index of clicked column
  const existingIndex = newSortBy.indexOf(clickedColumn);

  if (clickedType === null) {
    // Remove column if sortType is null
    if (existingIndex !== -1) {
      newSortBy.splice(existingIndex, 1);
      newSortType.splice(existingIndex, 1);
    }
  } else {
    // Remove existing if already in array
    if (existingIndex !== -1) {
      newSortBy.splice(existingIndex, 1);
      newSortType.splice(existingIndex, 1);
    }

    // Add clicked column as first in sort order
    newSortBy.unshift(clickedColumn);
    newSortType.unshift(clickedType);
  }
  
  // Update reactive values
  sortBy.value = newSortBy;
  sortType.value = newSortType;
}

const onCreateTicket = () => {
  router.push({ name: 'ticket-create' })
}

onMounted(() => {
  ticketsStore.fetchAll()
})
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
            @click="handleBulkDelete"
            @mouseenter="buttonHover = true"
            @mouseleave="buttonHover = false"
            :initial="{ opacity: 0, scale: 0.9 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.9 }"
            :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
            :whileHover="{ scale: 1.05 }"
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
            <span>{{ t('ticket.deleteTicketsText') }}</span>
          </motion.button>
        </AnimatePresence>

        <motion.button
          class="dashboard-header-button"
          type="button"
          :disabled="loading"
          :aria-busy="loading ? 'true' : 'false'"
          @click="onCreateTicket"
          :transition="{ duration: 0.2 }"
          :whileHover="{ scale: 1.03 }"
        >
          <SvgIcon name="create-ticket-icon" width="20px" height="20px" />
          <span>{{ t('ticket.createTicketText') }}</span>
        </motion.button>
      </div>
    </div>

    <div class="ticket-layout">
      <div id="ticket-filter-bar">
        <button
          id="ticket-filter-button"
          type="button"
          :disabled="loading"
          :aria-busy="loading ? 'true' : 'false'"
          @click.stop="handleFilterClick"
        >
          <SvgIcon name="filter-icon" height="20px" width="20px" />
          <span>{{ t('ticket.filterButtonText') }}</span>
        </button>

        <SearchInput :placeholder="t('ticket.searchTicketText')" variant="inline" v-model="searchInput" />

        <AnimatePresence>
          <motion.div
            class="filter-popout"
            v-if="isFilterOpen"
            v-click-outside="onClickOutside"
            role="region"
            :initial="{ opacity: 0, y: -16 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -16 }"
            :transition="{ type: 'spring', stiffness: 300, damping: 24 }"
          >
            <div
              v-for="section in filterSections"
              :key="section.id"
              class="filter-section"
            >
              <div 
                class="filter-section-header" 
                :class="{ open: section.isOpen }"
                @click="toggleFilterSection(section)"
              >
                {{ section.title }}
              </div>

              <AnimatePresence>
                <motion.div
                  v-if="section.isOpen"
                  class="filter-section-content"
                  :id="`filter-section-${section.id}-content`"
                  :initial="{ opacity: 0.3, maxHeight: 0 }"
                  :animate="{ opacity: 1, maxHeight: 300 }"
                  :exit="{ opacity: 0.3, maxHeight: 0 }"
                  :transition="{ type: 'spring', stiffness: 100, damping: 16, bounce: 0.1 }"
                  style="overflow: hidden;"
                >
                  <label
                    v-for="option in section.options"
                    :key="option"
                    class="filter-checkbox-label"
                  >
                    <input type="checkbox" :value="option" v-model="section.model" />
                    {{ option }}
                  </label>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <PrivilegedDataTable
        :headers="columns"
        :items="filteredItems"
        :search-value="searchInput"
        :rows-per-page="10"
        :theme-color="'var(--color-highlight)'"
        header-class-name="table-header"
        table-class-name="ticket-table"
        header-text-direction="center"
        body-text-direction="center"
        v-model:items-selected="itemsSelected"
        buttons-pagination
        multi-sort
        :sort-by="sortBy"
        :sort-type="sortType"
        @click-row="onClickTicketRow"
        @update-sort="onUpdateSort"
      >
        <template #item-priorityValue="{ priorityValue, priority }">
          <TicketPriorityPill :priority="priority" />
        </template>

        <template #item-name="{ name }">
          <span class="ticket-name-indicator">{{ name }}</span>
        </template>

        <template #item-type="{ type }">
          <TicketTypePill :type="type" />
        </template>

        <template #item-creationDate="{ creationDate }">
          <div class="call-date">
            <span class="ticket-date-indicator">{{ formatIsoDate(creationDate).date }}</span>
            <span>{{ formatIsoDate(creationDate).time }}</span>
          </div>
        </template>

        <template #item-projectName="{ projectName }">
          <span>{{ projectName }}</span>
        </template>

        <template #item-contractTypeValue="{ contractTypeDisplay }">
          <span class="ticket-contract-indicator">
              {{ contractTypeDisplay }}
          </span>
        </template>

        <template #item-lastUpdated="{ lastUpdated }">
          <div class="call-date">
            <span class="ticket-date-indicator">{{ formatIsoDate(lastUpdated).date }}</span>
            <span>{{ formatIsoDate(lastUpdated).time }}</span>
          </div>
        </template>

        <template #item-status="{ status }">
          <TicketStatusPill :status="status"/>
        </template>

        <template #empty-message>
          <span class="ticket-no-data">{{ t('ticket.noDataFoundText') }}</span>
        </template>
      </PrivilegedDataTable>
    </div>
  </div>
</template>

<style>
.ticket-layout {
  flex: 1;
  background-color: var(--color-menu-background);
  margin: 12px;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

#ticket-filter-bar {
  display: flex;
  flex-direction: row;
  overflow: visible;
  position: relative;
}

#ticket-filter-button {
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

#ticket-filter-button[disabled] {
  opacity: 0.6;
  cursor: default;
}

#ticket-filter-button span {
  font-size: 13px;
  font-weight: 700;
}

.call-date {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.ticket-table {
  user-select: none;

  --easy-table-border: none;
  --easy-table-row-border: none;

  --easy-table-header-font-size: 14px;

  --easy-table-header-height: 40px;
  --easy-table-body-row-height: 60px;
  --easy-table-footer-height: 60px;

  --easy-table-body-row-font-size: 12px;

  --easy-table-header-font-color: var(--color-text);
  --easy-table-header-background-color: var(--color-menu-background);
  --easy-table-body-row-font-color: var(--color-text);
  --easy-table-body-row-background-color: var(--color-menu-background);
  --easy-table-footer-font-color: var(--color-text);
  --easy-table-footer-background-color: var(--color-menu-background);

  --easy-table-body-row-hover-font-color: var(--color-text);
  --easy-table-body-row-hover-background-color: none;

  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ticket-table th {
  font-weight: 700;
}

.ticket-name-indicator {
  font-weight: 700;
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-date-indicator {
  font-weight: 700;
}

.ticket-contract-indicator {
  color: var(--color-subtext);
  font-weight: 700;
}

.ticket-no-data {
  color: var(--color-text);
  font-style: italic;
}

.dashboard-header-button {
  width: 136px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text);
  background: var(--color-menu-background);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 2px 4px;
}

.dashboard-header-button[disabled] {
  opacity: 0.6;
  cursor: default;
}

.dashboard-header-button span {
  font-size: 13px;
  font-weight: 700;
}

.dashboard-button-container {
  display: flex;
  gap: 16px;
}




/* TESTING: */
.status-checkboxes {
  display: flex;
  gap: 16px;
  margin: 12px 0;
  flex-wrap: wrap;
}

.status-checkboxes label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  cursor: pointer;
}

/* Filter Popout Styles */

.filter-popout {
  position: absolute;
  z-index: 20;
  background-color: var(--color-menu-background);
  border: 1px solid var(--color-subtext);
  border-radius: 4px;
  padding: 16px;
  top: 44px;
  width: 100%;
  box-shadow: 0 4px 12px var(--color-shadow);
  font-weight: 600;
  color: var(--color-text);
  user-select: none;
}

.filter-section {
  max-width: 75%;
  padding-left: 16px;
}

.filter-section-header {
  font-weight: 700;
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.filter-section-header.open {
  background-color: var(--color-highlight);
  color: var(--vt-c-white);
}

.filter-section-content {
  display: flex;
  flex-direction: column;
  padding-left: 8px;
}

.filter-checkbox-label {
  display: flex;
  align-items: center;
  border-left: 2px var(--color-text) solid;
  gap: 6px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 16px;
}

.filter-checkbox-label:hover {
  border-left: 4px var(--color-highlight) solid;
}


/* Custom checkbox styling for filter checkboxes (matches LoginForm.vue) */
.filter-checkbox-label input[type='checkbox'] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  height: 14px;
  width: 14px;
  border: 1px solid var(--color-subtext);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

.filter-checkbox-label input[type='checkbox']:checked {
  background-color: var(--color-highlight);
  border: var(--color-highlight);
}

.filter-checkbox-label input[type='checkbox']:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 6px;
  height: 10px;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
  border-color: white;
  border-style: solid;
}
</style>