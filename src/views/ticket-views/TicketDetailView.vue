<script setup>
import { ref, watch, computed } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import { useRoute } from 'vue-router'
import { formatIsoDate } from '@/utils/formatIsoDate'
import { useI18n } from 'vue-i18n'
import { formatMinutes } from '@/utils/formatMinutes'
import { capitalizeWords } from '@/utils/capitalizeWords'
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
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const { t } = useI18n()

// Core state
const ticketData = ref(null)
const selectedFiles = ref([])
const isLoadingTicket = ref(true)
const loadError = ref(false)

// Response form state
const replyText = ref('')
const timeSpentMinutes = ref(0)
const submitting = ref(false)

/**
 * Fetch ticket details by ID
 * Watches the route param to re-fetch if user navigates to another ticket.
 */
async function fetchTicket() {
  isLoadingTicket.value = true
  loadError.value = false
  try {
    const response = await api.get(`/serviceTickets/${route.params.id}`)
    ticketData.value = response.data
  } catch (error) {
    console.error('Failed to fetch ticket details:', error)
    loadError.value = true
  } finally {
    isLoadingTicket.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    fetchTicket()
  },
  { immediate: true }
)

/**
 * Download a file from this ticket.
 * If it's an image or PDF, open in new tab; else trigger a download.
 */
async function downloadAttachment(fileId, filename) {
  try {
    const response = await api.get(
      `/serviceTickets/${ticketData.value.id}/files/${fileId}`,
      { responseType: 'blob' }
    )

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
  } catch (error) {
    console.error('Failed to download file:', error)
  }
}

async function deleteAttachment(fileId) {
  try {
    const response = await api.delete(`/serviceTickets/${ticketData.value.id}/files/${fileId}`)
    console.log(response)
    // const blob = new Blob([response.data], { type: response.headers['content-type'] })
    // const blobUrl = window.URL.createObjectURL(blob)

    // const ct = (response.headers['content-type'] || '').toLowerCase()
    // if (ct.includes('pdf') || ct.startsWith('image/')) {
    //   window.open(blobUrl, '_blank')
    // } else {
    //   const link = document.createElement('a')
    //   link.href = blobUrl
    //   link.download = filename
    //   document.body.appendChild(link)
    //   link.click()
    //   document.body.removeChild(link)
    // }

    // window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}

/**
 * Submit a new response for this ticket.
 * Guards against empty or invalid input.
 */
async function submitReply() {
  if (!replyText.value.trim()) return
  submitting.value = true

  try {
    await api.post('/ticketResponses', {
      response: DOMPurify.sanitize(replyText.value),
      serviceTicketId: ticketData.value.id,
      minutesSpent: Math.max(0, timeSpentMinutes.value)
    })

    if (selectedFiles.value.length > 0) {
      const formData = new FormData()
      selectedFiles.value.forEach(file => formData.append('files', file))
      await api.post(`/serviceTickets/${ticketData.value.id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    replyText.value = ''
    timeSpentMinutes.value = 0
    await fetchTicket()
  } catch (error) {
    console.error('Failed to submit response:', error)
  } finally {
    submitting.value = false
  }
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

const serviceContract = computed(() => ticketData.value?.project?.serviceContract || null)

const isContractValid = computed(() => {
  const c = serviceContract.value
  if (!c?.startDate || !c?.endDate) return false
  const now = new Date()
  const start = new Date(c.startDate)
  const end = new Date(c.endDate)
  return now >= start && now <= end
})

const remainingContractMinutes = computed(() => {
  const c = serviceContract.value
  if (!c?.contractTime) return 0
  const used = c.usedTime || 0
  const remaining = Math.max(0, c.contractTime - used)

  return formatMinutes(remaining)
})

const contractTypeLabel = computed(() => {
  const type = ticketData.value?.project?.serviceContract?.type || 'none'
  return t('ticket.contract' + capitalizeWords(type).replaceAll('_', '') + 'Text')
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

    <div v-else-if="loadError" class="ticket-detail-error">
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
              </div>
            </div>
          </header>
  
          <VisualSeparator />
  
          <!-- DESCRIPTION -->
          <section class="ticket-detail-item">
            <UserInfoTile 
              :firstName="ticketData.submittedBy.firstName" 
              :lastName="ticketData.submittedBy.lastName"
              :subtext="`${formatIsoDate(ticketData.creationDate).date}, ${formatIsoDate(ticketData.creationDate).time}`"
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
        <section class="ticket-detail-section" id="ticket-add-response">
          <QuillEditor
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
            <div class="time-log-control">
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
            
            <LoaderButton :loading="submitting" :label="t('base.createText')" type="button" @click="submitReply" aria-busy="submitting" />
          </div>
        </section>
      </div>

      <!-- META INFO -->
      <div id="ticket-meta">
        <div class="ticket-meta-information">
          <section class="ticket-meta-information-section">
            <h3 class="ticket-meta-header">{{ t('ticket.detailsCallerInfoHeaderText') }}</h3>

            <div class="ticket-info-line">
              <span class="info-line-key">{{ t('base.fullNameText') }}</span>
              <span class="info-line-value">{{ ticketData.submittedBy?.firstName }} {{ ticketData.submittedBy?.lastName }}</span>
            </div>

            <div class="ticket-info-line">
              <span class="info-line-key">{{ t('base.emailText')}}</span>
              <span class="info-line-value">{{ ticketData.submittedBy?.email }}</span>
            </div>

            <div class="ticket-info-line">
              <span class="info-line-key">{{ t('base.phoneNumberText') }}</span>
              <span class="info-line-value">{{ ticketData.submittedBy?.phoneNumber }}</span>
            </div>
          </section>

          <VisualSeparator />

          <section class="ticket-meta-information-section">
            <h3 class="ticket-meta-header">{{ t('ticket.detailsProjectInfoHeaderText')}}</h3>

            <div class="ticket-info-line">
              <span class="info-line-key">{{ t('ticket.detailsProjectLabelText') }}</span>
              <span class="info-line-value">{{ ticketData.project?.name }}</span>
            </div>

            <div class="ticket-info-line">
              <span class="info-line-key">{{ t('ticket.detailsContractTypeLabelText') }}</span>
              <span class="info-line-value">{{ contractTypeLabel }}</span>
            </div>

            <div v-if="serviceContract" class="ticket-info-line">
              <span class="info-line-key">{{ t('ticket.detailsContractStatusLabelText') }}</span>
              <span class="info-line-value" :class="isContractValid ? 'valid' : 'expired'">
                {{ isContractValid ? t('ticket.detailsContractStatusValidText') : t('ticket.detailsContractStatusExpiredText') }}
              </span>
            </div>

            <div v-if="serviceContract" class="ticket-info-line">
              <span class="info-line-key">{{ t('ticket.detailsContractTimeLabelText') }}</span>
              <span class="info-line-value">{{ remainingContractMinutes }}</span>
            </div>
          </section>
        </div>

        <div v-if="ticketData.files && Object.keys(ticketData.files).length" class="ticket-meta-information">
          <section class="ticket-files">
            <h3 class="ticket-meta-header">{{ t('ticket.detailsAttachedFilesHeaderText') }}</h3>

            <ul class="file-list">
              <li v-for="(filename, id) in ticketData.files" :key="id" class="file-item">
                <div class="file-preview">
                  <span class="file-type">{{ filename.split('.').pop().toUpperCase() }}</span>
                </div>
                
                <div class="file-name">{{ filename }}</div>
                <button
                  type="button"
                  class="file-action-button"
                  @click="downloadAttachment(id, filename)"
                >
                  <SvgIcon name="icon-download" width="12px" />
                </button>

                <button
                  type="button"
                  class="file-action-button"
                  @click="deleteAttachment(id)"
                >
                  <SvgIcon name="icon-delete-file" width="12px" />
                </button>
              </li>
            </ul>
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
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 4px;
  align-self: flex-start;
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

.ticket-info-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 12px;
}

.info-line-key {
  font-weight: 700;
  color: var(--color-subtext);
}

.info-line-value {
  font-weight: 500;
}

.info-line-value.valid {
  color: var(--vt-c-green);
}

.info-line-value.expired {
  color: var(--vt-c-red);
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
.file-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: var(--color-soft-pink);
  border: 1px solid var(--color-highlight);
  border-radius: 6px;
  padding: 8px 12px;
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background-color: var(--vt-c-pink);
}

.file-preview {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: var(--vt-c-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--color-subtext);
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-action-button {
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
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
</style>