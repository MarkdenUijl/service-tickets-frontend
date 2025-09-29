<script setup>
import RouteInfo from '@/components/common/RouteInfo.vue'
import api from '@/utils/api'
import { ref, computed } from 'vue'
import SearchBar from '@/components/user-input/SearchBar.vue'
import { useI18n } from 'vue-i18n'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'
import { capitalizeWords } from '@/utils/capitalizeWords'

const loading = ref(false)
const searchInput = ref('')
const itemsSelected = ref([])

// NOTE: Make headers reactive to locale changes
const { t, locale } = useI18n()
const columns = computed(() => {
  // Depend explicitly on locale for recompute
  // eslint-disable-next-line no-unused-expressions
  locale.value
  return [
    { text: t('ticket.columnIdText'), value: 'id', sortable: true },
    { text: t('ticket.columnTicketTitleText'), value: 'name' },
    { text: t('ticket.columnTypeText'), value: 'type', sortable: true },
    { text: t('ticket.columnCallTimeText'), value: 'creationDate', sortable: true },
    { text: t('ticket.columnProjectTitleText'), value: 'project', sortable: true },
    { text: t('ticket.columnContractTypeText'), value: 'contractType', sortable: true },
    { text: t('ticket.columnLastUpdatedText'), value: 'lastUpdated', sortable: true },
    { text: t('ticket.columnStatusText'), value: 'status', sortable: true }
  ]
})

// Placeholder demo data (kept local; will be replaced by backend)
const items = ref([
  { id: 1, name: 'Light flickering in hallway', type: 'HARDWARE', creationDate: '2024-05-01T08:30:00', project: 'Building A Renovation', contractType: 'Maintenance', responses: [ { creationDate: '2024-05-01T08:30:00' }, { creationDate: '2024-05-02T10:00:00' } ], lastUpdated: '2024-05-02T10:00:00', status: 'OPEN' },
  { id: 2, name: 'Heating system failure', type: 'SOFTWARE', creationDate: '2024-05-03T09:15:00', project: 'Office Expansion', contractType: 'Repair', responses: [ { creationDate: '2024-05-03T09:15:00' }, { creationDate: '2024-05-04T12:00:00' } ], lastUpdated: '2024-05-04T12:00:00', status: 'IN_PROGRESS' },
  { id: 3, name: 'Water leakage in basement', type: 'CHANGE', creationDate: '2024-05-02T14:00:00', project: 'Warehouse Upgrade', contractType: 'Emergency', responses: [ { creationDate: '2024-05-02T14:00:00' }, { creationDate: '2024-05-03T09:30:00' } ], lastUpdated: '2024-05-03T09:30:00', status: 'CLOSED' },
  { id: 4, name: 'Broken window replacement', type: 'QUESTION', creationDate: '2024-05-05T11:45:00', project: 'Main Office Repairs', contractType: 'Maintenance', responses: [ { creationDate: '2024-05-05T11:45:00' }, { creationDate: '2024-05-06T14:15:00' } ], lastUpdated: '2024-05-06T14:15:00', status: 'OPEN' },
  { id: 5, name: 'Network outage', type: 'SOFTWARE', creationDate: '2024-05-04T16:20:00', project: 'Data Center Setup', contractType: 'Repair', responses: [ { creationDate: '2024-05-04T16:20:00' }, { creationDate: '2024-05-05T10:00:00' } ], lastUpdated: '2024-05-05T10:00:00', status: 'IN_PROGRESS' },
  { id: 6, name: 'Fire alarm malfunction', type: 'HARDWARE', creationDate: '2024-05-01T07:50:00', project: 'Safety Compliance', contractType: 'Inspection', responses: [ { creationDate: '2024-05-01T07:50:00' }, { creationDate: '2024-05-02T08:00:00' } ], lastUpdated: '2024-05-02T08:00:00', status: 'CLOSED' },
  { id: 7, name: 'Air conditioning noise', type: 'UNKNOWN', creationDate: '2024-05-03T13:30:00', project: 'Office Expansion', contractType: 'Repair', responses: [ { creationDate: '2024-05-03T13:30:00' }, { creationDate: '2024-05-04T09:00:00' } ], lastUpdated: '2024-05-04T09:00:00', status: 'ESCALATED' },
  { id: 8, name: 'Door lock jammed', type: 'HARDWARE', creationDate: '2024-05-02T10:10:00', project: 'Building B Security', contractType: 'Maintenance', responses: [ { creationDate: '2024-05-02T10:10:00' }, { creationDate: '2024-05-03T11:30:00' } ], lastUpdated: '2024-05-03T11:30:00', status: 'IN_PROGRESS' },
  { id: 9, name: 'Elevator not responding', type: 'CHANGE', creationDate: '2024-05-05T15:00:00', project: 'Building C Renovation', contractType: 'Emergency', responses: [ { creationDate: '2024-05-05T15:00:00' }, { creationDate: '2024-05-06T10:45:00' } ], lastUpdated: '2024-05-06T10:45:00', status: 'OPEN' },
  { id: 10, name: 'Lighting upgrade request', type: 'SOFTWARE', creationDate: '2024-05-04T09:00:00', project: 'Lobby Redesign', contractType: 'Project', responses: [ { creationDate: '2024-05-04T09:00:00' }, { creationDate: '2024-05-05T13:15:00' } ], lastUpdated: '2024-05-05T13:15:00', status: 'CLOSED' },
  { id: 11, name: 'Roof inspection', type: 'QUESTION', creationDate: '2024-05-01T12:00:00', project: 'Annual Maintenance', contractType: 'Inspection', responses: [ { creationDate: '2024-05-01T12:00:00' }, { creationDate: '2024-05-02T14:00:00' } ], lastUpdated: '2024-05-02T14:00:00', status: 'PENDING' },
  { id: 12, name: 'Server room cooling issue', type: 'SOFTWARE', creationDate: '2024-05-03T17:30:00', project: 'Data Center Setup', contractType: 'Repair', responses: [ { creationDate: '2024-05-03T17:30:00' }, { creationDate: '2024-05-04T15:00:00' } ], lastUpdated: '2024-05-04T15:00:00', status: 'IN_PROGRESS' },
  { id: 13, name: 'Parking lot lighting failure', type: 'HARDWARE', creationDate: '2024-05-02T20:00:00', project: 'Facility Maintenance', contractType: 'Emergency', responses: [ { creationDate: '2024-05-02T20:00:00' }, { creationDate: '2024-05-03T18:30:00' } ], lastUpdated: '2024-05-03T18:30:00', status: 'CLOSED' },
  { id: 14, name: 'Window cleaning request', type: 'CHANGE', creationDate: '2024-05-05T08:45:00', project: 'Building A Renovation', contractType: 'Project', responses: [ { creationDate: '2024-05-05T08:45:00' }, { creationDate: '2024-05-06T09:50:00' } ], lastUpdated: '2024-05-06T09:50:00', status: 'OPEN' },
  { id: 15, name: 'Security camera offline', type: 'QUESTION', creationDate: '2024-05-04T14:20:00', project: 'Building B Security', contractType: 'Repair', responses: [ { creationDate: '2024-05-04T14:20:00' }, { creationDate: '2024-05-05T16:10:00' } ], lastUpdated: '2024-05-05T16:10:00', status: 'IN_PROGRESS' },
  { id: 16, name: 'Water heater malfunction', type: 'SOFTWARE', creationDate: '2024-05-01T09:10:00', project: 'Main Office Repairs', contractType: 'Repair', responses: [ { creationDate: '2024-05-01T09:10:00' }, { creationDate: '2024-05-02T11:00:00' } ], lastUpdated: '2024-05-02T11:00:00', status: 'CLOSED' },
  { id: 17, name: 'Fire extinguisher refill', type: 'HARDWARE', creationDate: '2024-05-03T11:25:00', project: 'Safety Compliance', contractType: 'Maintenance', responses: [ { creationDate: '2024-05-03T11:25:00' }, { creationDate: '2024-05-04T12:30:00' } ], lastUpdated: '2024-05-04T12:30:00', status: 'OPEN' },
  { id: 18, name: 'Floor tile replacement', type: 'CHANGE', creationDate: '2024-05-02T13:40:00', project: 'Lobby Redesign', contractType: 'Project', responses: [ { creationDate: '2024-05-02T13:40:00' }, { creationDate: '2024-05-03T15:00:00' } ], lastUpdated: '2024-05-03T15:00:00', status: 'PENDING' },
  { id: 19, name: 'Internet connectivity slow', type: 'SOFTWARE', creationDate: '2024-05-05T10:50:00', project: 'Office Expansion', contractType: 'Repair', responses: [ { creationDate: '2024-05-05T10:50:00' }, { creationDate: '2024-05-06T11:20:00' } ], lastUpdated: '2024-05-06T11:20:00', status: 'OPEN' },
  { id: 20, name: 'Backup generator test', type: 'UNKNOWN', creationDate: '2024-05-04T16:35:00', project: 'Facility Maintenance', contractType: 'Inspection', responses: [ { creationDate: '2024-05-04T16:35:00' }, { creationDate: '2024-05-05T17:00:00' } ], lastUpdated: '2024-05-05T17:00:00', status: 'CLOSED' }
])

// --- Helpers
const fetchTickets = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const response = await api.get('/serviceTickets')
    console.log(response)
  } catch (error) {
    console.log(error?.status || error)
  } finally {
    loading.value = false
  }
}

const onClickTicketRow = (item) => {
  console.log(item)
}

function formatIsoDate(isoString) {
  const dateObj = new Date(isoString)
  const options = { month: 'short', day: 'numeric', year: 'numeric' }
  const date = dateObj.toLocaleDateString(undefined, options)
  const time = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
  return { date, time }
}

function formatLastResponse(responses) {
  if (Array.isArray(responses) && responses.length) {
    return formatIsoDate(responses[responses.length - 1].creationDate)
  }
  return null
}
</script>

<template>
  <div class="dashboard-view-wrapper">
    <div class="dashboard-header-items">
      <RouteInfo />
    </div>

    <div class="ticket-layout">
      <div id="ticket-filter-bar">
        <button
          id="ticket-filter-button"
          type="button"
          :disabled="loading"
          :aria-busy="loading ? 'true' : 'false'"
          @click="fetchTickets"
        >
          <SvgIcon name="filter-icon" height="20px" width="20px" />
          <span>{{ t('ticket.filterButtonText') }}</span>
        </button>
        <SearchBar :placeholder="t('ticket.searchTicketText')" variant="inline" v-model="searchInput" />
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
        @click-row="onClickTicketRow"
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

        <template #item-project="{ project }">
          <span class="ticket-name-indicator">{{ project }}</span>
        </template>

        <template #item-contractType="{ contractType }">
          <span class="ticket-contract-indicator">{{ contractType.toLowerCase() }}</span>
        </template>

        <template #item-lastUpdated="{ responses }">
          <div class="cell-date">
            <template v-if="formatLastResponse(responses)">
              <span class="ticket-date-indicator">{{ formatLastResponse(responses).date }}</span>
              <span>{{ formatLastResponse(responses).time }}</span>
            </template>
            <span v-else>-</span>
          </div>
        </template>

        <template #item-status="{ status }">
          <span class="ticket-status-indicator" :class="'status-' + status.toLowerCase()">
            {{ t('ticket.status' + capitalizeWords(status) + 'Text') }}
          </span>
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

#ticket-filter-button[disabled] { opacity: 0.6; cursor: default; }

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

.ticket-table th { font-weight: 700; }

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

.type-hardware { background-color: var(--color-highlight); }
.type-software { background-color: var(--color-first-complementary); }
.type-question { background-color: var(--color-second-complementary); }
.type-change { background-color: var(--color-third-complementary); }
.type-unknown { background-color: var(--color-secondary); }

.ticket-date-indicator { font-weight: 700; }

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

.status-open { background-color: var(--color-tile-mild-back); color: var(--color-tile-mild-contrast); }
.status-closed { background-color: var(--color-tile-great-back); color: var(--color-tile-great-contrast); }
.status-pending { background-color: var(--color-tile-medium-back); color: var(--color-tile-medium-contrast); }
.status-in_progress { background-color: var(--color-tile-good-back); color: var(--color-tile-good-contrast); }
.status-escalated { background-color: var(--color-tile-dire-back); color: var(--color-tile-dire-contrast); }
</style>