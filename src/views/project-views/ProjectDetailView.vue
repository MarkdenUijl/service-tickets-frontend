<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isContractCurrentlyValid, getRemainingContractTime, getContractTypeKey } from '@/utils/contractHelpers'
import { safeApiCall } from '@/utils/safeApiCall'
import { formatIsoDate } from '@/utils/formatIsoDate'
import api from '@/services/api'
import RouteInfo from '@/components/common/RouteInfo.vue'
import VisualSeparator from '@/components/graphic-items/VisualSeparator.vue'
import TicketInfoLine from '@/components/lists/TicketInfoLine.vue'
import TicketStatusPill from '@/components/graphic-items/TicketStatusPill.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// Core state
const projectData = ref(null)
const isLoadingProject = ref(true)
const hasLoadError = ref(false)

// Tickets UI state
const showAllTickets = ref(false)

/**
 * Fetch project details by ID.
 */
async function loadProject() {
  isLoadingProject.value = true
  hasLoadError.value = false
  
  const projectLoaded = await safeApiCall(
    async () => {
      const response = await api.get(`/projects/${route.params.id}`)
      projectData.value = response.data
      return response.data
    },
    'Failed to fetch project details'
  )

  if (!projectLoaded) hasLoadError.value = true
  isLoadingProject.value = false
}

watch(() => route.params.id, loadProject, { immediate: true })

// --- Computed helpers --- //
const serviceContract = computed(() => projectData.value?.serviceContract || null)
const isContractValid = computed(() => isContractCurrentlyValid(serviceContract.value))
const remainingContractMinutes = computed(() => getRemainingContractTime(serviceContract.value))
const contractTypeLabel = computed(() => t(getContractTypeKey(serviceContract.value)))

const projectAddress = computed(() => {
  if (!projectData.value) return ''
  const { street, houseNumber, zipCode, city } = projectData.value

  const streetPart = street ? `${street} ${houseNumber ?? ''}`.trim() : ''
  return [streetPart, zipCode, city].filter(Boolean).join(', ')
})

const hasTickets = computed(
  () => Array.isArray(projectData.value?.tickets) && projectData.value.tickets.length > 0
)

const formattedTickets = computed(() => {
  if (!hasTickets.value) return []

  return projectData.value.tickets
    .map(ticket => {
      const { date } = formatIsoDate(ticket.creationDate)
      return {
        ...ticket,
        creationDateFormatted: date
      }
    })
    .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate)) // newest first
})

// Only show 3 tickets unless expanded
const displayedTickets = computed(() => {
  if (!hasTickets.value) return []
  const list = formattedTickets.value
  return showAllTickets.value ? list : list.slice(0, 3)
})

// Navigation helper
function goToTicket(ticketId) {
  if (!ticketId) return
  router.push({ name: 'ticket-detail', params: { id: ticketId } })
}
</script>

<template>
  <div class="dashboard-view-wrapper">
    <div class="dashboard-header-items">
      <RouteInfo />
    </div>

    <div v-if="isLoadingProject" class="project-detail-loading" aria-busy="true">
      <span>{{ t('ticket.detailsLoadingText') }}</span>
    </div>

    <div v-else-if="hasLoadError" class="project-detail-error">
      <span>{{ t('ticket.detailsLoadingErrorText') }}</span>
    </div>

    <div v-else-if="projectData" class="project-detail-view">
      <div id="project-detail">
        <!-- MAIN CARD -->
        <section class="project-detail-section" id="project-main">
          <!-- HEADER -->
          <header class="project-header">
            <div class="project-header-info">
              <h2 class="project-title">{{ projectData.name }}</h2>
              <p class="project-subtitle">
                {{ projectAddress }}
              </p>
            </div>
          </header>

          <VisualSeparator />

          <!-- CONTENT GRID -->
          <div class="project-content-grid">
            <!-- General info -->
            <section class="project-info-block">
              <h3 class="project-section-title">
                {{ t('project.detailsGeneralInfoHeaderText', 'General information') }}
              </h3>

              <TicketInfoLine 
                :label="t('project.detailsProjectIdLabelText', 'Project ID')"
                :value="projectData.id"
              />

              <TicketInfoLine 
                :label="t('project.detailsCityLabelText', 'City')"
                :value="projectData.city"
              />

              <TicketInfoLine 
                :label="t('project.detailsZipCodeLabelText', 'Zip code')"
                :value="projectData.zipCode"
              />

              <TicketInfoLine 
                :label="t('project.detailsStreetLabelText', 'Street')"
                :value="projectData.street"
              />

              <TicketInfoLine 
                :label="t('project.detailsHouseNumberLabelText', 'House number')"
                :value="projectData.houseNumber"
              />
            </section>

            <!-- Contract info -->
            <section class="project-info-block">
              <h3 class="project-section-title">
                {{ t('project.detailsContractHeaderText', 'Service contract') }}
              </h3>

              <TicketInfoLine 
                :label="t('ticket.detailsContractTypeLabelText')"
                :value="serviceContract ? contractTypeLabel : t('project.detailsNoContractText', 'No contract')" 
              />

              <TicketInfoLine 
                v-if="serviceContract"
                :label="t('ticket.detailsContractStatusLabelText')"
                :value="isContractValid ? t('ticket.detailsContractStatusValidText') : t('ticket.detailsContractStatusExpiredText')"
                :valueClass="isContractValid ? 'valid' : 'expired'"
              />

              <TicketInfoLine 
                v-if="serviceContract"
                :label="t('ticket.detailsContractTimeLabelText')"
                :value="remainingContractMinutes"
              />

              <TicketInfoLine 
                v-if="serviceContract?.startDate"
                :label="t('project.detailsContractStartLabelText', 'Start date')"
                :value="serviceContract.startDate"
              />

              <TicketInfoLine 
                v-if="serviceContract?.endDate"
                :label="t('project.detailsContractEndLabelText', 'End date')"
                :value="serviceContract.endDate"
              />
            </section>
          </div>
        </section>

        <!-- TICKETS LIST -->
        <section
          v-if="hasTickets"
          class="project-detail-section"
          id="project-tickets"
        >
          <h3 class="project-section-title">
            {{ t('project.detailsTicketsHeaderText', 'Tickets on this project') }}
          </h3>

          <ul class="project-tickets-list">
            <li
              v-for="ticket in displayedTickets"
              :key="ticket.id"
              class="project-ticket-row"
              @click="goToTicket(ticket.id)"
            >
              <div class="project-ticket-main">
                <span class="project-ticket-title">{{ ticket.name }}</span>
                <span class="project-ticket-meta">
                  <TicketStatusPill :status="ticket.status"/>
                  <span class="project-ticket-date">{{ ticket.creationDateFormatted }}</span>
                </span>
              </div>
            </li>
          </ul>

          <button
            v-if="formattedTickets.length > 3"
            type="button"
            class="toggle-tickets-button"
            @click="showAllTickets = !showAllTickets"
          >
            {{ showAllTickets ? t('base.showLessText') : t('base.showMoreText') }}
          </button>
        </section>
      </div>
    </div>

    <div v-else class="project-detail-error">
      <span>{{ t('ticket.detailsTicketNotFoundText') }}</span>
    </div>
  </div>
</template>

<style scoped>
.project-detail-view {
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin: 12px;
}

#project-detail {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
}

/* Base card styling – similar to ticket-detail-section */
.project-detail-section {
  background-color: var(--color-menu-background);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* HEADER */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-title {
  font-size: 20px;
  font-weight: 700;
}

.project-subtitle {
  font-size: 13px;
  color: var(--color-subtext);
}

/* CONTENT GRID */
.project-content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.project-info-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-section-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
}

/* Tickets list – styled similar to the file list */
.project-tickets-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-ticket-row {
  padding: 10px 12px;
  border-radius: 8px;
  display: flex;
  user-select: none;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  color: var(--color-highlight);
  background-color: var(--color-soft-pink);
  border: 1px solid var(--color-highlight);
  border-radius: 6px;
  padding: 8px 12px;
  transition: background-color 0.2s ease;
}

.project-ticket-row:hover {
  background-color: var(--vt-c-pink);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
}

.project-ticket-main {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 4px;
}

.project-ticket-title {
  font-size: 13px;
  font-weight: 600;
}

.project-ticket-meta {
  display: flex;
  /* width: 100%; */
  justify-content: space-between;
  font-size: 11px;
}

.project-ticket-date {
  color: var(--color-text);
}

/* Toggle button – mirrors the files toggle style */
.toggle-tickets-button {
  align-self: flex-end;
  color: var(--color-text);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px;
  margin-top: 8px;
  background: none;
  border: none;
}

.toggle-tickets-button:hover {
  color: var(--color-highlight);
}

/* Loading / error states */
.project-detail-loading,
.project-detail-error {
  margin: 16px;
  padding: 16px 24px;
  border-radius: 8px;
  background-color: var(--color-menu-background);
}
</style>