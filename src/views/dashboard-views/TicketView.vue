<script setup>
import RouteInfo from '@/components/common/RouteInfo.vue'
import api from '@/utils/api'
import { ref } from 'vue'
import SearchBar from '@/components/user-input/SearchBar.vue'
import { useI18n } from 'vue-i18n'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'
import { capitalizeWords } from '@/utils/capitalizeWords'

const loading = ref(false)
const searchInput = ref('')
const itemsSelected = ref([])
const { t } = useI18n()

const handleButtonClick = async () => {
  if (loading.value) return // Guard against double submits
  loading.value = true

  try {
    const response = await api.get('/serviceTickets');

    console.log(response)
  } catch (error) {
    const status = error?.response?.status

    console.log(status)
  } finally {
    loading.value = false
  }
}

const clickTicketRow = (item) => {
  console.log(item)
}

const columns = [
  { text: t('ticket.columnIdText'), value: 'id', sortable: true },
  { text: t('ticket.columnTicketTitleText'), value: 'name' },
  { text: t('ticket.columnTypeText'), value: 'type', sortable: true },
  { text: t('ticket.columnCallTimeText'), value: 'creationDate', sortable: true },
  { text: t('ticket.columnProjectTitleText'), value: 'project', sortable: true },
  { text: t('ticket.columnContractTypeText'), value: 'contractType', sortable: true },
  { text: t('ticket.columnLastUpdatedText'), value: 'lastUpdated', sortable: true },
  { text: t('ticket.columnStatusText'), value: 'status', sortable: true }
]

const items = ref([
  { id: 1, name: 'Light flickering in hallway', type: 'HARDWARE', creationDate: '2024-05-01 08:30', project: 'Building A Renovation', contractType: 'Maintenance', lastUpdated: '2024-05-02', status: 'Open' },
  { id: 2, name: 'Heating system failure', type: 'SOFTWARE', creationDate: '2024-05-03 09:15', project: 'Office Expansion', contractType: 'Repair', lastUpdated: '2024-05-04', status: 'In Progress' },
  { id: 3, name: 'Water leakage in basement', type: 'CHANGE', creationDate: '2024-05-02 14:00', project: 'Warehouse Upgrade', contractType: 'Emergency', lastUpdated: '2024-05-03', status: 'Closed' },
  { id: 4, name: 'Broken window replacement', type: 'QUESTION', creationDate: '2024-05-05 11:45', project: 'Main Office Repairs', contractType: 'Maintenance', lastUpdated: '2024-05-06', status: 'Open' },
  { id: 5, name: 'Network outage', type: 'SOFTWARE', creationDate: '2024-05-04 16:20', project: 'Data Center Setup', contractType: 'Repair', lastUpdated: '2024-05-05', status: 'In Progress' },
  { id: 6, name: 'Fire alarm malfunction', type: 'HARDWARE', creationDate: '2024-05-01 07:50', project: 'Safety Compliance', contractType: 'Inspection', lastUpdated: '2024-05-02', status: 'Closed' },
  { id: 7, name: 'Air conditioning noise', type: 'UNKNOWN', creationDate: '2024-05-03 13:30', project: 'Office Expansion', contractType: 'Repair', lastUpdated: '2024-05-04', status: 'Open' },
  { id: 8, name: 'Door lock jammed', type: 'HARDWARE', creationDate: '2024-05-02 10:10', project: 'Building B Security', contractType: 'Maintenance', lastUpdated: '2024-05-03', status: 'In Progress' },
  { id: 9, name: 'Elevator not responding', type: 'CHANGE', creationDate: '2024-05-05 15:00', project: 'Building C Renovation', contractType: 'Emergency', lastUpdated: '2024-05-06', status: 'Open' },
  { id: 10, name: 'Lighting upgrade request', type: 'SOFTWARE', creationDate: '2024-05-04 09:00', project: 'Lobby Redesign', contractType: 'Project', lastUpdated: '2024-05-05', status: 'Closed' },
  { id: 11, name: 'Roof inspection', type: 'QUESTION', creationDate: '2024-05-01 12:00', project: 'Annual Maintenance', contractType: 'Inspection', lastUpdated: '2024-05-02', status: 'Open' },
  { id: 12, name: 'Server room cooling issue', type: 'SOFTWARE', creationDate: '2024-05-03 17:30', project: 'Data Center Setup', contractType: 'Repair', lastUpdated: '2024-05-04', status: 'In Progress' },
  { id: 13, name: 'Parking lot lighting failure', type: 'HARDWARE', creationDate: '2024-05-02 20:00', project: 'Facility Maintenance', contractType: 'Emergency', lastUpdated: '2024-05-03', status: 'Closed' },
  { id: 14, name: 'Window cleaning request', type: 'CHANGE', creationDate: '2024-05-05 08:45', project: 'Building A Renovation', contractType: 'Project', lastUpdated: '2024-05-06', status: 'Open' },
  { id: 15, name: 'Security camera offline', type: 'QUESTION', creationDate: '2024-05-04 14:20', project: 'Building B Security', contractType: 'Repair', lastUpdated: '2024-05-05', status: 'In Progress' },
  { id: 16, name: 'Water heater malfunction', type: 'SOFTWARE', creationDate: '2024-05-01 09:10', project: 'Main Office Repairs', contractType: 'Repair', lastUpdated: '2024-05-02', status: 'Closed' },
  { id: 17, name: 'Fire extinguisher refill', type: 'HARDWARE', creationDate: '2024-05-03 11:25', project: 'Safety Compliance', contractType: 'Maintenance', lastUpdated: '2024-05-04', status: 'Open' },
  { id: 18, name: 'Floor tile replacement', type: 'CHANGE', creationDate: '2024-05-02 13:40', project: 'Lobby Redesign', contractType: 'Project', lastUpdated: '2024-05-03', status: 'In Progress' },
  { id: 19, name: 'Internet connectivity slow', type: 'SOFTWARE', creationDate: '2024-05-05 10:50', project: 'Office Expansion', contractType: 'Repair', lastUpdated: '2024-05-06', status: 'Open' },
  { id: 20, name: 'Backup generator test', type: 'UNKNOWN', creationDate: '2024-05-04 16:35', project: 'Facility Maintenance', contractType: 'Inspection', lastUpdated: '2024-05-05', status: 'Closed' }])
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
          @click="handleButtonClick"
        >
          <SvgIcon name="filter-icon" height="20px" width="20px"/>
          <span>{{ t('ticket.filterButtonText') }}</span>
        </button>
        <SearchBar :placeholder="t('ticket.searchTicketText')" variant="inline" v-model="searchInput"/>
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

        @click-row="clickTicketRow"
      >
        <template #item-type="{ type }">
          <span 
            class="type-indicator"
            :class="'type-' + type.toLowerCase()"
          >
            {{ t('ticket.type' + capitalizeWords(type) + 'Text') }}
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

#ticket-filter-button span {
  font-size: 13px;
  font-weight: 700;
}


.ticket-table {
  user-select: none;
  

  --easy-table-border: none;
  --easy-table-row-border: none;

  --easy-table-header-font-size: 13px;

  --easy-table-header-height: 40px;
  --easy-table-body-row-height: 60px;

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

.ticket-table td {
}

.type-indicator {
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
</style>