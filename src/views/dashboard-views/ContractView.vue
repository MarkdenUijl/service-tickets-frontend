<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { useI18n } from 'vue-i18n'
import { PRIVILEGES } from '@/constants/privileges'
import { useContractStore } from '@/stores/contractStore'
import { capitalizeWords } from '@/utils/capitalizeWords'
import { getUsedTimeColorClass } from '@/utils/getUsedTimeColorClass'

import RouteInfo from '@/components/common/RouteInfo.vue'
import PrivilegedDataTable from '@/components/graphic-items/PrivilegedDataTable.vue'
import SearchInput from '@/components/user-input/SearchInput.vue'
import VisualSeparator from '@/components/graphic-items/VisualSeparator.vue'
import SearchDropdown from '@/components/user-input/SearchDropdown.vue'
import LoaderButton from '@/components/buttons/LoaderButton.vue'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'
import FilterPopout from '@/components/lists/FilterPopout.vue'

const { t } = useI18n()
const contractStore = useContractStore()

const searchInput = ref('')
const itemsSelected = ref([])
const loading = ref(false)
const buttonHover = ref(false)
const expandedContractDrafts = reactive({})
const sortBy = ref(['endDate'])
const sortType = ref(['desc'])
const isFilterOpen = ref(false)

const showExpiredContracts = computed(() =>
  selectedContractFilters.value.includes('SHOW_EXPIRED')
)

const columns = computed(() => {
  return [
    { text: t('contract.columnProjectText'), value: 'projectName', sortable: true },
    { text: t('contract.columnTypeText'), value: 'contractTypeDisplay', sortable: true },
    { text: t('contract.startDateLabelText'), value: 'startDate', sortable: true },
    { text: t('contract.endDateLabelText'), value: 'endDate', sortable: true },
    { text: t('contract.usedTimeLabelText'), value: 'usedTimeDisplay' }
  ]
})

const items = computed(() => contractStore.contracts.map(normalizeContract))

const filteredItems = computed(() =>
  items.value.filter(contract => {
    // If expired should NOT be shown, filter them out
    if (!showExpiredContracts.value && contract.isExpired) {
      return false
    }
    return true
  })
)

function normalizeContract(contract) {
  const contractTypeValue = contract.type

  let contractTypeDisplay = capitalizeWords(
    contractTypeValue
      .replaceAll('_', ' ')
      .toLowerCase()
  )

  const contractEndDateStr = contract.endDate
  let isExpired = false

  if (contractEndDateStr) {
    const contractEndDate = new Date(contractEndDateStr)
    const today = new Date()
    contractEndDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    if (contractEndDate < today) {
      isExpired = true
      contractTypeDisplay = t('ticket.detailsContractStatusExpiredText')
    }
  }

  const usedTimeDisplay = `${contract.usedTime} / ${contract.contractTime} ${t('base.minutesText')}`
  const usedTimeColorClass = getUsedTimeColorClass(contract)

  return {
    ...contract,
    contractTypeValue,
    contractTypeDisplay,
    usedTimeDisplay,
    usedTimeColorClass,
    isExpired
  }
}

function handleFilterClick() {
  isFilterOpen.value = !isFilterOpen.value
}

const CONTRACT_FILTERS = ['SHOW_EXPIRED']

const selectedContractFilters = ref([])

const filterSections = reactive([
  {
    id: 'contractStatus',
    title: 'ContractStatus',
    isOpen: false,
    type: 'checkbox',
    options: CONTRACT_FILTERS,
    model: selectedContractFilters
  }
])

function getContractBaseRenewConfig(contract) {
  const baseType = contract.type || contract.contractTypeValue || 'OFFICE_HOURS'
  const baseHours = typeof contract.contractTime === 'number'
    ? Math.round(contract.contractTime / 60)
    : 0

  return {
    hours: baseHours,
    type: baseType
  }
}

function getContractDraft(contract) {
  if (!expandedContractDrafts[contract.id]) {
    const base = getContractBaseRenewConfig(contract)

    expandedContractDrafts[contract.id] = {
      usedTime: contract.usedTime,
      contractTime: contract.contractTime,
      endDate: contract.endDate,
      renewHours: base.hours,
      renewType: base.type
    }
  }
  return expandedContractDrafts[contract.id]
}

function isRenewDraftPristine(contract) {
  const draft = getContractDraft(contract)
  const base = getContractBaseRenewConfig(contract)

  return draft.renewHours === base.hours && draft.renewType === base.type
}

function buildContractUpdateBody(contract, draftOverrides = {}) {
  const baseType = contract.type || contract.contractTypeValue
  const projectId = contract.projectId

  const contractTimeFromOverrides =
    typeof draftOverrides.hours === 'number'
      ? draftOverrides.hours * 60
      : draftOverrides.contractTime

  return {
    projectId,
    type: draftOverrides.type || baseType,
    contractTime: typeof contractTimeFromOverrides === 'number'
      ? contractTimeFromOverrides
      : contract.contractTime,
    usedTime: typeof draftOverrides.usedTime === 'number'
      ? draftOverrides.usedTime
      : contract.usedTime,
    startDate: contract.startDate,
    endDate: draftOverrides.endDate || contract.endDate
  }
}

async function saveContractChanges(contract, draftOverrides) {
  const body = buildContractUpdateBody(contract, draftOverrides)

  try {
    loading.value = true
    await contractStore.update(contract.id, body)
    await contractStore.fetchAll()
  } catch (error) {
    console.error('Failed to update contract', error)
  } finally {
    loading.value = false
  }
}

async function handleUpdateContract(contract) {
  const draft = getContractDraft(contract)

  await saveContractChanges(contract, {
    contractTime: draft.contractTime,
    usedTime: draft.usedTime,
    endDate: draft.endDate
  })
}

async function handleRenewContract(contract) {
  const draft = getContractDraft(contract)

  try {
    loading.value = true

    await contractStore.renew(contract.id, {
      type: draft.renewType,
      hours: draft.renewHours
    })

    await contractStore.fetchAll()
  } catch (error) {
    console.error('Failed to renew contract', error)
  } finally {
    loading.value = false
  }
}

async function deleteContract(contractId) {
  try {
    await contractStore.remove(contractId)
  } catch (error) {
    console.log(error?.status || error)
  }
}

async function handleQuickRenewContract(contract) {
  const draft = getContractDraft(contract)
  const base = getContractBaseRenewConfig(contract)

  draft.renewHours = base.hours
  draft.renewType = base.type

  await handleRenewContract(contract)
}

const contractHoursItems = [
  { value: 8, label: `8 ${t('base.hoursText')}` },
  { value: 12, label: `12 ${t('base.hoursText')}` },
  { value: 16, label: `16 ${t('base.hoursText')}` },
  { value: 20, label: `20 ${t('base.hoursText')}` },
  { value: 24, label: `24 ${t('base.hoursText')}` }
]

const contractTypeItems = [
  { value: 'FULL_TIME', label: t('ticket.contractFulltimeText') },
  { value: 'OFFICE_HOURS', label: t('ticket.contractOfficehoursText')}
]

function onClickContractRow(item) {
  console.log(item)
}

async function handleBulkDelete() {
  if (!itemsSelected.value.length) return
  for (const item of itemsSelected.value) {
    await deleteContract(item.id)
  }
  itemsSelected.value = []

  contractStore.fetchAll()
}

onMounted(() => {
  contractStore.fetchAll()
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
              <span>{{ t('contract.deleteContractsText') }}</span>
            </motion.button>
          </AnimatePresence>
        </div>
    </div>

    <div class="contract-layout">
      <div id="contract-filter-bar">
        <button
          id="contract-filter-button"
          type="button"
          :disabled="loading"
          :aria-busy="loading ? 'true' : 'false'"
          @click.stop="handleFilterClick"
        >
          <SvgIcon name="filter-icon" height="20px" width="20px" />
          <span>{{ t('base.filterButtonText') }}</span>
        </button>

        <SearchInput
          :placeholder="t('contract.searchContractsText')"
          variant="inline"
          v-model="searchInput"
        />

        <FilterPopout
          v-model:isOpen="isFilterOpen"
          :sections="filterSections"
          namespace="contract"
        />
      </div>

      <PrivilegedDataTable
        :headers="columns"
        :items="filteredItems"
        :search-value="searchInput"
        :rows-per-page="10"
        :theme-color="'var(--color-highlight)'"
        :sortBy="sortBy"
        :sortType="sortType"
        header-class-name="table-header"
        table-class-name="data-table"
        header-text-direction="center"
        body-text-direction="center"
        v-model:items-selected="itemsSelected"
        buttons-pagination
        @click-row="onClickContractRow"
        :privilege-key="PRIVILEGES.MODIFY_CONTRACTS"
      >
        <template #item-projectName="{ projectName }">
          <span class="project-name-indicator">{{ projectName }}</span>
        </template>

        <template #item-contractTypeDisplay="{ contractTypeDisplay }">
          <span class="contract-type-indicator">
              {{ contractTypeDisplay }}
          </span>
        </template>

        <template #item-usedTimeDisplay="{ usedTimeDisplay, usedTimeColorClass }">
          <span :class="['used-time-indicator', usedTimeColorClass]">
            {{ usedTimeDisplay }}
          </span>
        </template>

        <template #expand="contract">
          <div class="row-expand-container">
            <div class="contract-expand-section">
              <span class="contract-expand-header">
                {{ t('contract.adjustHeaderText') }}
              </span>

              <div class="contract-expand-grid">
                <div class="contract-expand-field">
                  <label
                    class="contract-expand-label"
                    :for="`usedTime-${contract.id}`"
                  >
                    {{ t('contract.adjustUsedTimeLabelText') }}
                  </label>
                  <input
                    :id="`usedTime-${contract.id}`"
                    v-model.number="getContractDraft(contract).usedTime"
                    type="number"
                    min="0"
                    class="contract-expand-input"
                  />
                </div>

                <div class="contract-expand-field">
                  <label
                    class="contract-expand-label"
                    :for="`contractTime-${contract.id}`"
                  >
                    {{ t('contract.adjustContractTimeLabelText') }}
                  </label>
                  <input
                    :id="`contractTime-${contract.id}`"
                    v-model.number="getContractDraft(contract).contractTime"
                    type="number"
                    min="0"
                    class="contract-expand-input"
                  />
                </div>

                <div class="contract-expand-field">
                  <label :for="`endDate-${contract.id}`" class="contract-expand-label">
                    {{ t('contract.adjustEndDateLabelText') }}
                  </label>

                  <div class="contract-expand-input-wrapper-date">
                    <input
                      :id="`endDate-${contract.id}`"
                      v-model="getContractDraft(contract).endDate"
                      type="date"
                      class="contract-expand-input"
                    />

                    <SvgIcon class="contract-calendar-icon" name="calendar-icon" height="16px" width="16px"/>
                  </div>
                </div>
              </div>

              <div class="contract-expand-actions">
                <LoaderButton
                  :loading="false"
                  :label="t('contract.saveChangesText')"
                  @click.stop="handleUpdateContract(contract)"
                />
              </div>
            </div>

            <VisualSeparator orientation="vertical" :separator-text="t('base.orText')"/>

            <div class="contract-expand-section">
              <span class="contract-expand-header">
                {{ t('contract.renewHeaderText') }}
              </span>

              <p class="contract-expand-description">
                {{ t('contract.renewDescriptionText') }}
              </p>

              <div class="contract-expand-grid">
                <div class="contract-expand-field">
                  <label
                    class="contract-expand-label"
                    :for="`renewHours-${contract.id}`"
                  >
                    {{ t('contract.renewHoursLabelText') }}
                  </label>

                  <SearchDropdown
                    :items="contractHoursItems"
                    :model-value="getContractDraft(contract).renewHours"
                    value-key="value"
                    label-key="label"
                    :icon-indent="12"
                    @update:modelValue="value => (getContractDraft(contract).renewHours = value)"
                  />
                </div>

                <div class="contract-expand-field">
                  <label
                    class="contract-expand-label"
                    :for="`renewType-${contract.id}`"
                  >
                    {{ t('contract.renewTypeLabelText') }}
                  </label>
                  
                  <SearchDropdown
                    :items="contractTypeItems"
                    :model-value="getContractDraft(contract).renewType"
                    value-key="value"
                    label-key="label"
                    :icon-indent="12"
                    @update:modelValue="value => (getContractDraft(contract).renewType = value)"
                  />
                </div>
              </div>

              <div class="contract-expand-actions">
                <LoaderButton
                  v-if="isRenewDraftPristine(contract)"
                  :loading="false"
                  :label="t('contract.quickRenewText')"
                  variant="outline"
                  @click.stop="handleQuickRenewContract(contract)"
                />
                <LoaderButton
                  v-else
                  :loading="false"
                  :label="t('contract.renewContractText')"
                  @click.stop="handleRenewContract(contract)"
                />
              </div>
            </div>
          </div>
        </template>

        <template #empty-message>
          <span class="contract-no-data">{{ t('contract.noDataFoundText') }}</span>
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

#contract-filter-button {
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

#contract-filter-button[disabled] {
  opacity: 0.6;
  cursor: default;
}

#contract-filter-button span {
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

.contract-type-indicator {
  color: var(--color-subtext);
  font-weight: 700;
}

.used-time-indicator {
  font-weight: 600;
}

.used-time-safe {
  color: var(--color-tile-great-contrast);
}

.used-time-warning {
  color: var(--color-tile-mild-contrast);
}

.used-time-critical {
  color: var(--color-tile-priority-critical-contrast);
}

.contract-no-data {
  color: var(--color-text);
  font-style: italic;
}

.row-expand-container {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  cursor: default;
  gap: 12px;
  padding: 12px;
  background-color: var(--color-menu-background);
}

.contract-expand-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  border-radius: 8px;
}

.contract-expand-header {
  font-size: 16px;
  font-weight: 700;
  font-family: 'Noto sans JP';
  color: var(--color-text);
}

.contract-expand-description {
  font-size: 12px;
  color: var(--color-subtext);
  line-height: 1.4;
}

.contract-expand-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px 16px;
}

.contract-expand-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.contract-expand-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-subtext);
}

.contract-expand-input {
  width: 100%;
  height: 40px;
  background-color: var(--color-menu-background);
  border: 1px solid var(--color-subtext);
  color: var(--color-subtext);
  border-radius: 4px;
  padding: 0 16px;
  font-size: 16px;
  font-family: 'Ubuntu', sans-serif;
  box-sizing: border-box;
  outline: none;
}

.contract-expand-input::-webkit-outer-spin-button,
.contract-expand-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.contract-expand-input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
}

.contract-expand-input:focus {
  border-color: var(--color-text);
  color: var(--color-text);
}

.contract-expand-input-wrapper-date {
  position: relative;
}

.contract-calendar-icon {
  position: absolute;
  right: 12px;
  pointer-events: none;
  top: 50%;
  transform: translateY(-50%);
  height: 18px;
  width: 18px;
  color: var(--color-subtext);
}

.contract-expand-actions {
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 12px;
}
</style>