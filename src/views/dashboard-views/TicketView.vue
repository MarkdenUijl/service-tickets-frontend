<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { motion, AnimatePresence } from 'motion-v'
import { useRouter } from 'vue-router'

import RouteInfo from '@/components/common/RouteInfo.vue'
import SearchInput from '@/components/user-input/SearchInput.vue'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'

import api from '@/services/api'
import { connectToTickets, disconnectFromTickets } from '@/services/websocket'
import { capitalizeWords } from '@/utils/capitalizeWords'

const router = useRouter();

const loading = ref(false)
const searchInput = ref('')
const items = ref([])
const itemsSelected = ref([])
const buttonHover = ref(false)

const sortBy = ref('lastUpdated')
const sortType = ref('desc')

const { t, locale } = useI18n()
const columns = computed(() => {
  locale.value
  return [
    { text: t('ticket.columnIdText'), value: 'id', sortable: true },
    { text: t('ticket.columnTicketTitleText'), value: 'name' },
    { text: t('ticket.columnTypeText'), value: 'type', sortable: true },
    { text: t('ticket.columnCallTimeText'), value: 'creationDate', sortable: true },
    { text: t('ticket.columnProjectTitleText'), value: 'projectName', sortable: true },
    { text: t('ticket.columnContractTypeText'), value: 'contractTypeValue', sortable: true },
    { text: t('ticket.columnLastUpdatedText'), value: 'lastUpdated', sortable: true },
    { text: t('ticket.columnStatusText'), value: 'status', sortable: true }
  ]
})


// Determine the last updated timestamp for a ticket.
function resolveLastUpdated(ticket) {
  if (Array.isArray(ticket.responses) && ticket.responses.length) {
    return ticket.responses[ticket.responses.length - 1].creationDate
  }
  return ticket.lastUpdated || ticket.creationDate
}

// Normalize a raw ticket from API/websocket into table-ready form.
function normalizeTicket(ticket) {
  return {
    ...ticket,
    projectName: ticket.project?.name || '',
    contractTypeValue: ticket.project?.serviceContract?.type || 'NONE',
    contractTypeDisplay: capitalizeWords(
      (ticket.project?.serviceContract?.type || 'NONE')
        .replaceAll('_', ' ')
        .toLowerCase()
    ),
    lastUpdated: resolveLastUpdated(ticket)
  }
}

async function fetchTickets() {
  if (loading.value) return
  loading.value = true
  try {
    const response = await api.get('/serviceTickets')
    items.value = response.data.map(normalizeTicket)
  } catch (error) {
    console.log(error?.status || error)
  } finally {
    loading.value = false
  }
}

async function deleteTicket(ticketId) {
  try {
    await api.delete(`/serviceTickets/${ticketId}`)
    items.value = items.value.filter(ticket => ticket.id !== ticketId)
  } catch (error) {
    console.log(error?.status || error)
  }
}

function handleFilterClick() {
  console.log('Clicking filter button')
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
}

function onUpdateSort(sortOptions) {
  sortBy.value = sortOptions.sortBy
  sortType.value = sortOptions.sortType
}

function formatIsoDate(isoString) {
  const dateObj = new Date(isoString)
  const options = { month: 'short', day: 'numeric', year: 'numeric' }
  const date = dateObj.toLocaleDateString('nl-NL', options)
  const time = dateObj.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  return { date, time }
}

const onCreateTicket = () => {
  router.push({ name: 'ticket-create' })
}

onMounted(() => {
  fetchTickets()

  // Listen for real-time updates
  connectToTickets(ticket => {
    const index = items.value.findIndex(t => t.id === ticket.id)
    if (index !== -1) {
      items.value[index] = normalizeTicket({ ...items.value[index], ...ticket })
    } else {
      items.value.push(normalizeTicket(ticket))
    }
  })
})

onUnmounted(() => {
  disconnectFromTickets()
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
          @click="handleFilterClick"
        >
          <SvgIcon name="filter-icon" height="20px" width="20px" />
          <span>{{ t('ticket.filterButtonText') }}</span>
        </button>

        <SearchInput :placeholder="t('ticket.searchTicketText')" variant="inline" v-model="searchInput" />
      </div>

      <EasyDataTable
        :headers="columns"
        :items="items"
        :search-value="searchInput"
        :rows-per-page="10"
        :theme-color="'var(--color-highlight)'"
        header-class-name="table-header"
        table-class-name="ticket-table"
        header-text-direction="center"
        body-text-direction="center"
        v-model:items-selected="itemsSelected"
        buttons-pagination
        :sort-by="sortBy"
        :sort-type="sortType"
        @click-row="onClickTicketRow"
        @update-sort="onUpdateSort"
      >
        <template #item-name="{ name }">
          <span class="ticket-name-indicator">{{ name }}</span>
        </template>

        <template #item-type="{ type }">
          <span class="ticket-type-indicator" :class="'type-' + type.toLowerCase()">
            {{ t('ticket.type' + capitalizeWords(type) + 'Text') }}
          </span>
        </template>

        <template #item-creationDate="{ creationDate }">
          <div class="cell-date">
            <span class="ticket-date-indicator">{{ formatIsoDate(creationDate).date }}</span>
            <span>{{ formatIsoDate(creationDate).time }}</span>
          </div>
        </template>

        <template #item-projectName="{ projectName }">
          <span>{{ projectName }}</span>
        </template>

        <template #item-contractTypeValue="{ contractTypeValue }">
          <span class="ticket-contract-indicator">
            {{ t('ticket.contract' + capitalizeWords(contractTypeValue).replaceAll('_', '') + 'Text') }}
          </span>
        </template>

        <template #item-lastUpdated="{ lastUpdated }">
          <div class="cell-date">
            <span class="ticket-date-indicator">{{ formatIsoDate(lastUpdated).date }}</span>
            <span>{{ formatIsoDate(lastUpdated).time }}</span>
          </div>
        </template>

        <template #item-status="{ status }">
          <span class="ticket-status-indicator" :class="'status-' + status.toLowerCase()">
            {{ t('ticket.status' + capitalizeWords(status) + 'Text') }}
          </span>
        </template>

        <template #empty-message>
          <span class="ticket-no-data">{{ t('ticket.noDataFoundText') }}</span>
        </template>
      </EasyDataTable>
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

.cell-date {
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

.ticket-type-indicator {
  display: inline-flex;
  width: 92px;
  height: 20px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 11px;
  color: var(--vt-c-white);
}

.type-hardware {
  background-color: var(--color-highlight);
}
.type-software {
  background-color: var(--color-first-complementary);
}
.type-question {
  background-color: var(--color-second-complementary);
}
.type-change {
  background-color: var(--color-third-complementary);
}
.type-unknown {
  background-color: var(--color-secondary);
}

.ticket-date-indicator {
  font-weight: 700;
}

.ticket-contract-indicator {
  color: var(--color-subtext);
  font-weight: 700;
}

.ticket-status-indicator {
  display: inline-flex;
  width: 92px;
  height: 20px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  font-size: 11px;
}

.status-open {
  background-color: var(--color-tile-mild-back);
  color: var(--color-tile-mild-contrast);
}
.status-closed {
  background-color: var(--color-tile-great-back);
  color: var(--color-tile-great-contrast);
}
.status-pending {
  background-color: var(--color-tile-medium-back);
  color: var(--color-tile-medium-contrast);
}
.status-in_progress {
  background-color: var(--color-tile-good-back);
  color: var(--color-tile-good-contrast);
}
.status-escalated {
  background-color: var(--color-tile-dire-back);
  color: var(--color-tile-dire-contrast);
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
</style>