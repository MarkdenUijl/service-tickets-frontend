<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import { useRoute } from 'vue-router'
import { formatIsoDate } from '@/utils/formatIsoDate'
import { useI18n } from 'vue-i18n'
import { connectToTicketDetail, disconnectFromTicketDetail } from '@/services/websocket'
import { isContractCurrentlyValid, getRemainingContractTime, getContractTypeKey } from '@/utils/contractHelpers'
import { useTickets } from '@/composables/useTickets'
import { safeApiCall } from '@/utils/safeApiCall'
import { useAuthStore } from '@/stores/authStore'
import { handleTicketUpdates } from '@/services/ticketSocketHandler'
import api from '@/services/api'
import RouteInfo from '@/components/common/RouteInfo.vue'
import TicketStatusPill from '@/components/graphic-items/TicketStatusPill.vue'
import VisualSeparator from '@/components/graphic-items/VisualSeparator.vue'
import TicketTypePill from '@/components/graphic-items/TicketTypePill.vue'
import TicketSourcePill from '@/components/graphic-items/TicketSourcePill.vue'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'
import DOMPurify from 'dompurify'
import UserInfoTile from '@/components/common/UserInfoTile.vue'
import FileDropzone from '@/components/user-input/FileDropzone.vue'
import LoaderButton from '@/components/buttons/LoaderButton.vue'
import RecentTicketsList from '@/components/lists/RecentTicketsList.vue'
import TicketInfoLine from '@/components/lists/TicketInfoLine.vue'
import FileItem from '@/components/lists/FileItem.vue'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import TicketPriorityPill from '@/components/graphic-items/TicketPriorityPill.vue'

const route = useRoute()
const { t } = useI18n()
const auth = useAuthStore()
const hasPrivilege = auth.hasPrivilege

// Core state
const { ticketData, recentUserTickets, recentProjectTickets, fetchTicketById, fetchRecentTickets } = useTickets()
const selectedFiles = ref([])
const isLoadingTicket = ref(true)
const isStatusUpdating = ref(false)
const hasLoadError = ref(false)
const quillRef = ref(null)
const showAllFiles = ref(false)

// Response form state
const replyText = ref('')
const timeSpentMinutes = ref(null)
const submitting = ref(false)

/**
 * Fetch ticket details by ID
 * Watches the route param to re-fetch if user navigates to another ticket.
 */
async function loadTicket() {
  isLoadingTicket.value = true
  hasLoadError.value = false
  
  const ticketLoaded = await safeApiCall(
    async () => {
      const ticket = await fetchTicketById(route.params.id)
      await fetchRecentTickets(ticket)
      return ticket
    },
    'Failed to fetch ticket details'
  )

  if (!ticketLoaded) hasLoadError.value = true
  isLoadingTicket.value = false
}

watch(() => route.params.id, loadTicket, { immediate: true })

/**
 * Download a file from this ticket.
 * If it's an image or PDF, open in new tab; else trigger a download.
 */
async function downloadAttachment(fileId, filename) {
  const response = await safeApiCall(
    () => api.get(`/serviceTickets/${ticketData.value.id}/files/${fileId}`, { responseType: 'blob' }),
    'Failed to download file'
  )
  if (!response) return

  const blob = new Blob([response.data], { type: response.headers['content-type'] })
  const blobUrl = window.URL.createObjectURL(blob)

  const ct = (response.headers['content-type'] || '').toLowerCase()
  if (ct.includes('pdf') || ct.startsWith('image/')) {
    window.open(blobUrl, '_blank')
  } else {
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  window.URL.revokeObjectURL(blobUrl)
}

async function deleteAttachment(fileId) {
  await safeApiCall(
    () => api.delete(`/serviceTickets/${ticketData.value.id}/files/${fileId}`),
    'Failed to delete file'
  )
}

const isClosed = computed(() => ticketData.value?.status === 'CLOSED')
const isEscalated = computed(() => ticketData.value?.status === 'ESCALATED')
const canEscalate = computed(() => !!ticketData.value && !isClosed.value && !isEscalated.value)


async function updateTicketStatus(nextStatus) {
  if (!ticketData.value) return
  if (isStatusUpdating.value) return

  isStatusUpdating.value = true

  await safeApiCall(
    async () => {
        await api.patch(`/serviceTickets/${ticketData.value.id}/status`, { status: nextStatus })
      // Rely on websocket broadcast to refresh ticketData
    },
    'Failed to update ticket status'
  )

  isStatusUpdating.value = false
}

async function closeTicket() {
  await updateTicketStatus('CLOSED')
}

async function openTicket() {
  await updateTicketStatus('OPEN')
}

async function escalateTicket() {
  await updateTicketStatus('ESCALATED')
}




/**
 * Submit a new response for this ticket.
 * Guards against empty or invalid input.
 */
async function submitReply() {
  if (!replyText.value.trim()) return
  submitting.value = true

  const responseResult = await safeApiCall(
    () => api.post('/ticketResponses', {
      response: DOMPurify.sanitize(replyText.value),
      serviceTicketId: ticketData.value.id,
      minutesSpent: Math.max(0, timeSpentMinutes.value)
    }),
    'Failed to submit response'
  )

  if (!responseResult) {
    submitting.value = false
    return
  }

  if (selectedFiles.value.length > 0) {
    const formData = new FormData()
    selectedFiles.value.forEach(file => formData.append('files', file))

    await safeApiCall(
      () => api.post(`/serviceTickets/${ticketData.value.id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      'Failed to upload attachments'
    )
  }

  replyText.value = ''
  selectedFiles.value = []
  timeSpentMinutes.value = null
  if (quillRef.value) quillRef.value.setHTML('')
  submitting.value = false
}

// --- Computed helpers --- //
const responses = computed(() => {
  const list = ticketData.value?.responses || []
  return list.map((r) => {
    const { date, time } = formatIsoDate(r.creationDate)
    return {
      id: r.id || `${r.creationDate}-${r.submittedBy?.email}`,
      authorFirstName: r.submittedBy?.firstName,
      authorLastName: r.submittedBy?.lastName,
      engineerResponse: r.engineerResponse,
      date,
      time,
      text: r.response
    }
  })
})

const isReplyDisabled = computed(() => {
  const text = replyText.value?.replace(/<[^>]*>/g, '').trim()
  const hasText = text.length > 0

  const quillText = quillRef.value?.getText()?.replace(/\s+/g, '') || ''
  const hasQuillText = quillText.length > 0

  const hasTime = hasPrivilege('CAN_MODERATE_SERVICE_TICKETS_PRIVILEGE') 
    ? timeSpentMinutes.value !== null && timeSpentMinutes.value > 0
    : true

  return !( (hasText || hasQuillText) && hasTime )
})

const serviceContract = computed(() => ticketData.value?.project?.serviceContract || null)
const isContractValid = computed(() => isContractCurrentlyValid(serviceContract.value))
const remainingContractMinutes = computed(() => getRemainingContractTime(serviceContract.value))
const contractTypeLabel = computed(() => t(getContractTypeKey(serviceContract.value)))

const creationDate = computed(() => {
  if (!ticketData.value?.creationDate) return { date: '', time: '' }
  return formatIsoDate(ticketData.value.creationDate)
})


const displayedFiles = computed(() => {
  if (!ticketData.value?.files) return {}
  const entries = Object.entries(ticketData.value.files)
  if (showAllFiles.value) return Object.fromEntries(entries)
  return Object.fromEntries(entries.slice(0, 3))
})

onMounted(() => {
  const ticketId = route.params.id
  connectToTicketDetail(ticketId, handleTicketUpdates(ticketData))
})

onUnmounted(() => {
  disconnectFromTicketDetail(route.params.id)
})
</script>

<template>
  <div class="dashboard-view-wrapper">
    <div class="dashboard-header-items">
      <RouteInfo />
    </div>

    <div v-if="isLoadingTicket" class="ticket-detail-loading" aria-busy="true">
      <span>{{ t('ticket.detailsLoadingText') }}</span>
    </div>

    <div v-else-if="hasLoadError" class="ticket-detail-error">
      <span>{{ t('ticket.detailsLoadingErrorText') }}</span>
    </div>

    <div v-else-if="ticketData" class="ticket-detail-view">
      <div id="ticket-detail">
        <div class="ticket-detail-section" id="ticket-call">
          <!-- HEADER -->
          <header class="ticket-header">
            <div class="ticket-header-info">
              <h2 class="ticket-title">{{ ticketData.name }}</h2>
              <div class="ticket-tags">
                <TicketStatusPill :status="ticketData.status" />
                <TicketTypePill :type="ticketData.type" />
                <TicketSourcePill :source="ticketData.source" />
                <TicketPriorityPill v-if="hasPrivilege('CAN_MODERATE_SERVICE_TICKETS_PRIVILEGE')" :priority="ticketData.priority" />
              </div>
            </div>


            <div v-if="hasPrivilege('CAN_MODERATE_SERVICE_TICKETS_PRIVILEGE')" class="status-actions">
              <button
                v-if="canEscalate"
                type="button"
                class="status-button"
                :disabled="isStatusUpdating"
                @click="escalateTicket"
              >
                {{ t('ticket.detailsEscalateTicketText') }}
              </button>

              <button
                type="button"
                class="status-button"
                :disabled="isStatusUpdating"
                @click="isClosed ? openTicket() : closeTicket()"
              >
                {{ isClosed ? t('ticket.detailsOpenTicketText') : t('ticket.detailsCloseTicketText') }}
              </button>
            </div>

          </header>
  
          <VisualSeparator />
  
          <!-- DESCRIPTION -->
          <section class="ticket-detail-item">
            <UserInfoTile 
              :firstName="ticketData.submittedBy.firstName" 
              :lastName="ticketData.submittedBy.lastName"
              :subtext="`${creationDate.date}, ${creationDate.time}`"
              :isFree="true"
            />
            <p>{{ ticketData.description }}</p>
          </section>
        </div>

        

        <!-- RESPONSES -->
        <section v-if="responses.length"  class="ticket-detail-section" id="ticket-responses">
          <section v-for="response in responses" 
            :key="response.id" 
            class="response-item ticket-detail-item"
            :class="response.engineerResponse ? 'engineer-response' : ''"
          >
            <UserInfoTile 
              :firstName="response.authorFirstName" 
              :lastName="response.authorLastName"
              :subtext="`${response.date}, ${response.time}`"
              :isFree="true"
            />
            <p v-html="response.text"></p>
          </section>
        </section>

        <!-- ADD RESPONSE -->
        <section 
          v-if="!isClosed"
          class="ticket-detail-section" 
          id="ticket-add-response"
        >
          <QuillEditor
            ref="quillRef"
            v-model:content="replyText"
            content-type="html"
            theme="snow"
            toolbar="minimal"
            placeholder="Write your response here"
          />

          <FileDropzone 
            v-model="selectedFiles"
            placeholder="Click or drag to add files to ticket"
          />

          <div class="response-actions">
            <LoaderButton
              :loading="submitting"
              :label="t('base.createText')"
              type="button"
              :disabled="isReplyDisabled"
              @click.stop="submitReply"
              aria-busy="submitting"
            />

            <div v-if="hasPrivilege('CAN_MODERATE_SERVICE_TICKETS_PRIVILEGE')" class="time-log-control">
              <SvgIcon name="icon-clock" width="16px" />
              <input
                type="number"
                v-model.number="timeSpentMinutes"
                min="0"
                placeholder="0"
                aria-label="Minutes spent"
              />
              <span class="unit">{{ t('base.minutesText') }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- META INFO -->
      <div id="ticket-meta">
        <div v-if="hasPrivilege('CAN_MODERATE_SERVICE_TICKETS_PRIVILEGE')" class="ticket-meta-information">
          <section class="ticket-meta-information-section">
            <h3 class="ticket-meta-header">{{ t('ticket.detailsCallerInfoHeaderText') }}</h3>

            <TicketInfoLine 
              :label="t('base.fullNameText')"
              :value="`${ ticketData.submittedBy?.firstName } ${ ticketData.submittedBy?.lastName }`"
            />

            <TicketInfoLine 
              :label="t('base.emailText')"
              :value="ticketData.submittedBy?.email"
            />

            <TicketInfoLine 
              :label="t('base.phoneNumberText')"
              :value="ticketData.submittedBy?.phoneNumber"
            />

            <TicketInfoLine 
              :label="t('ticket.recentTicketsByUserText')"
              value=""
            />

            <RecentTicketsList :tickets="recentUserTickets" :empty-text="t('ticket.detailsNoCallsByUserText')"/>
          </section>

          <VisualSeparator />

          <section class="ticket-meta-information-section">
            <h3 class="ticket-meta-header">{{ t('ticket.detailsProjectInfoHeaderText')}}</h3>

            <TicketInfoLine 
              :label="t('ticket.detailsProjectLabelText')"
              :value="ticketData.project?.name"
            />
            
            <TicketInfoLine 
              :label="t('ticket.detailsContractTypeLabelText')"
              :value="contractTypeLabel"
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
              :label="t('ticket.recentTicketsOnProjectText')"
              value=""
            />

            <RecentTicketsList :tickets="recentProjectTickets" :empty-text="t('ticket.detailsNoCallsOnProjectText')"/>
          </section>
        </div>

        <div v-if="ticketData.files && Object.keys(ticketData.files).length" class="ticket-meta-information">
          <section class="ticket-files">
            <h3 class="ticket-meta-header">{{ t('ticket.detailsAttachedFilesHeaderText') }}</h3>

            <ul class="file-list">
              <FileItem
                v-for="(filename, id) in displayedFiles"
                :key="id"
                :id="id"
                :filename="filename"
                @download="downloadAttachment"
                @delete="deleteAttachment"
              />
            </ul>

            <button
              v-if="Object.keys(ticketData.files).length > 3"
              type="button"
              class="toggle-files-button"
              @click="showAllFiles = !showAllFiles"
            >
              {{ showAllFiles ? t('base.showLessText') : t('base.showMoreText') }}
            </button>
          </section>
        </div>
      </div>
    </div>

    <div v-else class="ticket-detail-error">
      <span>{{ t('ticket.detailsTicketNotFoundText') }}</span>
    </div>
  </div>
</template>

<style scoped>
.ticket-detail-view {
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin: 12px;
}

#ticket-detail {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.ticket-detail-section {
  background-color: var(--color-menu-background);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: 0;
}

#ticket-call {
  border-radius: 8px 8px 0 0;
  padding: 24px;
}

#ticket-meta {
  min-width: 350px;
  flex: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 4px;
  align-self: flex-start;
  overflow-y: scroll;
  max-height: 100vh;
}

#ticket-meta::-webkit-scrollbar {
    display: none;
}

.ticket-meta-information {
  background-color: var(--color-menu-background);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: fit-content;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-header-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ticket-title {
  font-size: 20px;
  font-weight: 700;
}

.ticket-tags {
  display: flex;
  gap: 16px;
}

.ticket-meta-header {
  margin-bottom: 8px;
}

.ticket-meta-information-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ticket-detail-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-detail-item p {
  margin-left: 52px;
  white-space: pre-line;
}

/* --- File list --- */
.ticket-files {
  display: flex;
  flex-direction: column;
}

.file-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-files-button {
  align-self: flex-end;
  color: var(--color-text);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px;
  margin-top: 8px;
}

.toggle-files-button:hover {
  color: var(--color-highlight);
}

/* --- Responses --- */
.response-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.response-item {
  padding: 32px 24px;
  box-shadow: 0 -8px 8px -6px var(--color-shadow);
}

.engineer-response {
  border-left: var(--color-highlight) 4px solid;
}

#ticket-add-response {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 -8px 8px -6px var(--color-shadow);
  border-radius: 0 0 8px 8px;
}

.response-input {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text);
  resize: vertical;
}

.response-actions {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
}

.response-actions input {
  width: 80px;
  margin-left: 8px;
}

.time-log-control {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--color-background);
  border-radius: 24px;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--color-text);
  transition: background-color 0.2s ease;
}

.time-log-control:hover,
.time-log-control:focus-within {
  background-color: var(--color-soft-pink);
}

.time-log-control input {
  width: 60px;
  border: none;
  background: transparent;
  color: inherit;
  font-size: inherit;
  text-align: right;
  outline: none;
}

.time-log-control .unit {
  font-size: 12px;
  color: var(--color-subtext);
}

.time-log-control input::-webkit-outer-spin-button,
.time-log-control input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.time-log-control input[type="number"] {
  -moz-appearance: textfield;
}

button:disabled,
.loader-button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(60%);
}

/* --- Quill Editor Overrides --- */
:deep(.ql-container),
:deep(.ql-toolbar) {
  border: none !important;
  background: transparent;
}

:deep(.ql-editor) {
  min-height: 200px;
  font-family: 'Ubuntu';
  font-size: 14px;
  color: var(--color-text);
}

:deep(.ql-stroke) {
  stroke: var(--color-text);
}

:deep(.ql-toolbar button.ql-active .ql-stroke) {
  stroke: var(--color-text);
}

:deep(.ql-fill) {
  fill: var(--color-text);
}

:deep(.ql-toolbar button.ql-active .ql-fill) {
  fill: var(--color-text);
}

:deep(.ql-picker .ql-stroke) {
  stroke: var(--color-text) !important;
  fill: var(--color-text) !important;
}

:deep(.ql-toolbar button:hover),
:deep(.ql-toolbar button.ql-active),
:deep(.ql-align .ql-picker-item.ql-selected),
:deep(.ql-align .ql-picker-item:hover),
:deep(.ql-align .ql-picker-label.ql-active),
:deep(.ql-align.ql-picker:hover .ql-picker-label) {
  background-color: var(--color-soft-pink);
  border-radius: 4px;
}

:deep(.ql-picker-options) {
  background-color: var(--color-background);
  border: none !important;
}

:deep(.ql-editor.ql-blank::before) {
  color: var(--color-subtext);
}




.status-actions {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  height: 100%;
}

.status-button {
  position: relative;
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.status-button:hover {
  background: var(--color-soft-pink);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}
</style>