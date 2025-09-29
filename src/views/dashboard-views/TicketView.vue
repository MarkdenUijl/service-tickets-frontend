<script setup>
import RouteInfo from '@/components/common/RouteInfo.vue'
import api from '@/utils/api'
import { ref, computed, onMounted } from 'vue'
import SearchBar from '@/components/user-input/SearchBar.vue'
import { useI18n } from 'vue-i18n'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'
import { capitalizeWords } from '@/utils/capitalizeWords'

const loading = ref(false)
const searchInput = ref('')
const items = ref([])
const itemsSelected = ref([])

const sortBy = ref("lastUpdated");
const sortType = ref("desc");

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
    { text: t('ticket.columnProjectTitleText'), value: 'projectName', sortable: true },
    { text: t('ticket.columnContractTypeText'), value: 'contractTypeDisplay', sortable: true },
    { text: t('ticket.columnLastUpdatedText'), value: 'lastUpdated', sortable: true },
    { text: t('ticket.columnStatusText'), value: 'status', sortable: true }
  ]
})

// --- Helpers
function resolveLastUpdated(ticket) {
  if (Array.isArray(ticket.responses) && ticket.responses.length) {
    return ticket.responses[ticket.responses.length - 1].creationDate
  }
  return ticket.lastUpdated || ticket.creationDate
}

const fetchTickets = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const response = await api.get('/serviceTickets')

    items.value = response.data.map(ticket => ({
      ...ticket,
      projectName: ticket.project?.name || '',
      contractTypeValue: ticket.project?.serviceContract?.type || 'NONE',
      contractTypeDisplay: capitalizeWords(
          (ticket.project?.serviceContract?.type || 'NONE')
            .replaceAll('_', ' ')
            .toLowerCase()
        ),
      lastUpdated: resolveLastUpdated(ticket)
    }))
  } catch (error) {
    console.log(error?.status || error)
  } finally {
    loading.value = false
  }
}
const deleteTicket = async (ticketId) => {
  try {
    await api.delete('/serviceTickets/' + ticketId)
    // Update local state immediately
    items.value = items.value.filter(ticket => ticket.id !== ticketId)
  } catch (error) {
    console.log(error?.status || error)
  }
}

const createTicket = async () => {
  const body = {
    name : "The lights won't turn off",
    status : "open",
    type : "hardware",
    description : "The lights in room 1.01 are not functioning anymore",
    projectId : 51
  }

  try {
    await api.post('/serviceTickets', body)
  } catch (error) {
    console.log(error?.status || error)
  } finally {
    await fetchTickets()
  }
}

const onFilterButtonClick = async () => {
  if (!itemsSelected.value.length) return

  for (const item of itemsSelected.value) {
    await deleteTicket(item.id)
  }

  // Clear selection afterwards
  itemsSelected.value = []
}

const onClickTicketRow = (item) => {
  console.log(item)
}

const onUpdateSort = (sortOptions) => {
  sortBy.value = sortOptions.sortBy
  sortType.value = sortOptions.sortType
}

function formatIsoDate(isoString) {
  const dateObj = new Date(isoString)
  const options = { month: 'short', day: 'numeric', year: 'numeric' }
  const date = dateObj.toLocaleDateString('nl-NL', options)
  const time = dateObj.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', hour12: false })
  return { date, time }
}

// function formatLastResponse(responses) {
//   if (Array.isArray(responses) && responses.length) {
//     return formatIsoDate(responses[responses.length - 1].creationDate)
//   }
//   return null
// }

onMounted(() => {
  fetchTickets()
})
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
          @click="onFilterButtonClick"
        >
          <SvgIcon name="filter-icon" height="20px" width="20px" />
          <span>{{ t('ticket.filterButtonText') }}</span>
        </button>

        <button
          id="ticket-create-button"
          type="button"
          :disabled="loading"
          :aria-busy="loading ? 'true' : 'false'"
          @click="createTicket"
        >
          <span>New Ticket</span>
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
          <span >{{ projectName }}</span>
        </template>

        <template #item-contractTypeValue="{ contractTypeValue }">
          <span class="ticket-contract-indicator">{{ t('ticket.contract' + capitalizeWords(contractTypeValue).replaceAll('_', '') + 'Text') }}</span>
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

#ticket-create-button {
  width: 120px;
  border-radius: 0 4px 4px 0;
  border: 1px solid var(--color-subtext);
  border-left: none;
  cursor: pointer;
  color: var(--color-text);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-left: 12px;
}

#ticket-create-button[disabled] { opacity: 0.6; cursor: default; }

#ticket-create-button span {
  font-size: 13px;
  font-weight: 700;
}

</style>