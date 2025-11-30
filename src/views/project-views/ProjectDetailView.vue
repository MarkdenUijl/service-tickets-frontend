<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isContractCurrentlyValid, getRemainingContractTime, getContractTypeKey } from '@/utils/contractHelpers'
import { safeApiCall } from '@/utils/safeApiCall'
import { formatIsoDate } from '@/utils/formatIsoDate'
import api from '@/services/api'
import RouteInfo from '@/components/common/RouteInfo.vue'
import VisualSeparator from '@/components/graphic-items/VisualSeparator.vue'
import TicketInfoLine from '@/components/lists/TicketInfoLine.vue'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const { t } = useI18n()

// Core state
const projectData = ref(null)
const isLoadingProject = ref(true)
const hasLoadError = ref(false)

/**
 * Fetch project details by ID.
 * (Note: we use response.data here – axios returns a response object.)
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

// Optional: tickets info for this project
const hasTickets = computed(() => Array.isArray(projectData.value?.tickets) && projectData.value.tickets.length > 0)

const formattedTickets = computed(() => {
  if (!hasTickets.value) return []
  return projectData.value.tickets.map(ticket => {
    const { date } = formatIsoDate(ticket.creationDate)
    return {
      ...ticket,
      creationDateFormatted: date
    }
  })
})
</script>

<template>
  <div class="dashboard-view-wrapper">
    <div class="dashboard-header-items">
      <RouteInfo />
    </div>

    <div v-if="isLoadingProject" class="project-detail-loading" aria-busy="true">
      <span>{{ t('project.detailsLoadingText') }}</span>
    </div>

    <div v-else-if="hasLoadError" class="project-detail-error">
      <span>{{ t('project.detailsLoadingErrorText') }}</span>
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
                {{ t('project.detailsGeneralInfoHeaderText') }}
              </h3>

              <TicketInfoLine 
                :label="t('project.detailsProjectIdLabelText')"
                :value="projectData.id"
              />

              <TicketInfoLine 
                :label="t('project.detailsCityLabelText')"
                :value="projectData.city"
              />

              <TicketInfoLine 
                :label="t('project.detailsZipCodeLabelText')"
                :value="projectData.zipCode"
              />

              <TicketInfoLine 
                :label="t('project.detailsStreetLabelText')"
                :value="projectData.street"
              />

              <TicketInfoLine 
                :label="t('project.detailsHouseNumberLabelText')"
                :value="projectData.houseNumber"
              />
            </section>

            <!-- Contract info -->
            <section class="project-info-block">
              <h3 class="project-section-title">
                {{ t('project.detailsContractHeaderText') }}
              </h3>

              <TicketInfoLine 
                :label="t('ticket.detailsContractTypeLabelText')"
                :value="serviceContract ? contractTypeLabel : t('project.detailsNoContractText')" 
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
                :label="t('project.detailsContractStartLabelText')"
                :value="serviceContract.startDate"
              />

              <TicketInfoLine 
                v-if="serviceContract?.endDate"
                :label="t('project.detailsContractEndLabelText')"
                :value="serviceContract.endDate"
              />
            </section>
          </div>
        </section>

        <!-- TICKETS LIST (simple, non-sticky) -->
        <section
          v-if="hasTickets"
          class="project-detail-section"
          id="project-tickets"
        >
          <h3 class="project-section-title">
            {{ t('project.detailsTicketsHeaderText') }}
          </h3>

          <ul class="project-tickets-list">
            <li
              v-for="ticket in formattedTickets"
              :key="ticket.id"
              class="project-ticket-row"
            >
              <div class="project-ticket-main">
                <span class="project-ticket-title">{{ ticket.name }}</span>
                <span class="project-ticket-meta">
                  <span class="project-ticket-status">{{ ticket.status }}</span>
                  <span class="project-ticket-date">{{ ticket.creationDateFormatted }}</span>
                </span>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <div v-else class="project-detail-error">
      <span>{{ t('project.detailsProjectNotFoundText') }}</span>
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

.project-detail-section {
  background-color: var(--color-menu-background);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

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

/* Tickets list */
.project-tickets-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-ticket-row {
  padding: 12px 14px;
  border-radius: 8px;
  background-color: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-ticket-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-ticket-title {
  font-size: 13px;
  font-weight: 600;
}

.project-ticket-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--color-subtext);
}

.project-ticket-status {
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.project-ticket-date {
  opacity: 0.9;
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