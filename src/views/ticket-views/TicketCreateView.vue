<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectLookup } from '@/composables/useProjectLookup'
import { useTicketValidation } from '@/composables/useTicketValidation'
import { useUserLookup } from '@/composables/useUserLookup'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import RouteInfo from '@/components/common/RouteInfo.vue'
import ValidatedInput from '@/components/user-input/ValidatedInput.vue'
import api from '@/services/api'
import SearchDropdown from '@/components/user-input/SearchDropdown.vue'
import LoaderButton from '@/components/buttons/LoaderButton.vue'
import VisualSeparator from '@/components/graphic-items/VisualSeparator.vue'
import TextArea from '@/components/user-input/TextArea.vue'
import FileDropzone from '@/components/user-input/FileDropzone.vue'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()
const hasPrivilege = auth.hasPrivilege

const loading = ref(false)
const selectedFiles = ref([])

// Core form data
const ticketData = reactive({
  name: '',
  type: '',
  description: '',
  projectId: '',
  submittedByUserId: null,
  firstName: '',
  lastName: '',
  street: '',
  houseNumber: '',
  zipCode: '',
  city: '',
  source: null,
})

// Composables
const {
  errors,
  isNameValid,
  isStreetValid,
  isHouseNumberValid,
  isZipCodeValid,
  isCityValid,
  validateAll,
} = useTicketValidation(ticketData)

const { projects, fetchProjects, fetchProjectsByAddress, autofillAddress } =
  useProjectLookup(ticketData)

let users = ref([])
let fetchUsers = () => {}
let fetchUsersByFilter = () => {}
let autofillUserDetails = () => {}

if (hasPrivilege('CAN_MODERATE_SERVICE_TICKETS_PRIVILEGE')) {
  const userLookup = useUserLookup(ticketData)
  users = userLookup.users
  fetchUsers = userLookup.fetchUsers
  fetchUsersByFilter = userLookup.fetchUsersByFilter
  autofillUserDetails = userLookup.autofillUserDetails

  onMounted(fetchUsers)
}

// Autofill project details when selection changes
watch(() => ticketData.projectId, autofillAddress)

// Autofill user details when submittedByUserId changes
watch(() => ticketData.submittedByUserId, autofillUserDetails)

// Load projects on mount
onMounted(fetchProjects)

// Submit ticket creation form
async function handleSubmit() {
  if (!validateAll()) return

  let { name, type, description, projectId, submittedByUserId, source } = ticketData

  loading.value = true
  try {
    const { data } = await api.post('/serviceTickets', {
      name,
      status: 'open',
      type,
      description,
      projectId,
      submittedByUserId,
      source,
    })
    const createdTicketId = data.id

    if (selectedFiles.value.length > 0) {
      const formData = new FormData()
      selectedFiles.value.forEach(file => formData.append('files', file))
      await api.post(`/serviceTickets/${createdTicketId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    router.push('/dashboard/tickets')
  } catch (err) {
    console.error('Error creating ticket:', err)
  } finally {
    loading.value = false
  }
}

const handleTicketCancel = () => {
  router.push('/dashboard/tickets')
}

const ticketTypes = [
  { name: t('ticket.typeHardwareText'), type: 'HARDWARE' },
  { name: t('ticket.typeSoftwareText'), type: 'SOFTWARE' },
  { name: t('ticket.typeQuestionText'), type: 'QUESTION' },
  { name: t('ticket.typeChangeText'), type: 'CHANGE' },
  { name: t('ticket.typeUnknownText'), type: 'UNKNOWN' }
]

const ticketSources = [
  { name: t('ticket.sourceWebText'), source: 'WEB' },
  { name: t('ticket.sourcePhoneText'), source: 'PHONE' },
  { name: t('ticket.sourceMailText'), source: 'MAIL' },
]
</script>

<template>
  <div class="dashboard-view-wrapper">
    <div class="dashboard-header-items">
      <RouteInfo />
    </div>

    <div class="ticket-create-form-wrapper">
      <form class="ticket-create-form" @submit.prevent="handleSubmit">
        <div class="ticket-form-items">
          <div class="ticket-form-section">
            <span class="ticket-form-header">{{ t('ticket.creationTicketDetailsText') }}</span>

            <div class="ticket-information">
              <ValidatedInput
                id="name"
                v-model="ticketData.name"
                type="text"
                :placeholder="t('ticket.creationTicketNameText')"
                :isValid="isNameValid && errors.name === ''"
                :validationText="errors.name"
              />

              <div class="input-wrapper short-line">
                <SearchDropdown v-model="ticketData.type" :items="ticketTypes" :placeholder="t('ticket.creationTicketTypeText')"
                  label-key="name" value-key="type" :iconIndent="24" :dropdownHeight="60" />
                <span class="validation-text" v-if="errors.type">{{ errors.type }}</span>
              </div>
            </div>

            <div class="input-wrapper" style="height: 100%;">
              <TextArea v-model="ticketData.description" :label="t('ticket.creationTicketDescriptionText')" :rows="5" />
              <span class="validation-text" v-if="errors.description">{{ errors.description }}</span>
            </div>

            <FileDropzone v-model="selectedFiles" :maxFiles="8" :placeholder="t('ticket.creationTicketFilesText')" />
          </div>

          <VisualSeparator orientation="vertical" />

          <div class="ticket-form-section">
            <span class="ticket-form-header">{{ t('ticket.creationProjectDetailsText') }}</span>

            <div class="input-wrapper">
              <SearchDropdown v-model="ticketData.projectId" :items="projects" :placeholder="t('ticket.creationProjectSelectText')"
                label-key="name" value-key="id" :iconIndent="24" :dropdownHeight="60" />
              <span class="validation-text" v-if="errors.projectId">{{ errors.projectId }}</span>
            </div>

            <VisualSeparator :separatorText="t('ticket.creationSeparatorText')" />

            <div class="address-line">
              <ValidatedInput
                id="street"
                v-model="ticketData.street"
                type="text"
                :placeholder="t('ticket.creationProjectStreetText')"
                :isValid="isStreetValid && errors.street === ''"
                :validationText="errors.street"
                @blur="fetchProjectsByAddress"
              />

              <ValidatedInput
                id="houseNumber"
                class="short-line"
                v-model="ticketData.houseNumber"
                type="text"
                :placeholder="t('ticket.creationProjectHouseNoText')"
                :isValid="isHouseNumberValid && errors.houseNumber === ''"
                :validationText="errors.houseNumber"
                @blur="fetchProjectsByAddress"
              />
            </div>

            <div class="address-line">
              <ValidatedInput
                id="zipcode"
                class="short-line"
                v-model="ticketData.zipCode"
                type="text"
                :placeholder="t('ticket.creationProjectZipCodeText')"
                :isValid="isZipCodeValid && errors.zipCode === ''"
                :validationText="errors.zipCode"
                @blur="fetchProjectsByAddress"
              />

              <ValidatedInput
                id="city"
                v-model="ticketData.city"
                type="text"
                :placeholder="t('ticket.creationProjectCityText')"
                :isValid="isCityValid && errors.city === ''"
                :validationText="errors.city"
                @blur="fetchProjectsByAddress"
              />
            </div>

            <div v-if="hasPrivilege('CAN_MODERATE_SERVICE_TICKETS_PRIVILEGE')" class="ticket-form-section">
              <span class="ticket-form-header">{{ t('ticket.creationAdditionalInfoText') }}</span>

              <div id="ticket-admin-information">
                <div class="address-line">
                  <SearchDropdown v-model="ticketData.submittedByUserId" :items="users" :placeholder="t('ticket.creationSubmittedByText')"
                    label-key="email" value-key="id" :iconIndent="24" :dropdownHeight="60" />
                  <SearchDropdown class="short-line" v-model="ticketData.source" :items="ticketSources" :placeholder="t('ticket.creationSourceText')" label-key="name"
                    value-key="source" :iconIndent="24" :dropdownHeight="60" />
                </div>

                <div class="ticket-information ">
                  <ValidatedInput id="firstName" v-model="ticketData.firstName" type="text" :placeholder="t('ticket.creationFirstNameText')"
                    @blur="fetchUsersByFilter" />
                  <ValidatedInput id="lastName" v-model="ticketData.lastName" type="text" :placeholder="t('ticket.creationLastNameText')"
                    @blur="fetchUsersByFilter" />
                </div>
              </div>
            </div>

            <div id="ticket-buttons-container">
              <LoaderButton :loading="loading" :label="t('ticket.creationCreateTicketText')" type="submit" />
              <LoaderButton :label="t('base.cancelText')" @click="handleTicketCancel" />
            </div>
          </div>
        </div>
      </form>

    </div>
  </div>
</template>

<style scoped>
.ticket-create-form-wrapper {
  margin: 12px;
  padding: 48px;
  background-color: var(--color-menu-background);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.ticket-create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  flex: 1;
  align-items: center;
}

.ticket-form-items {
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
  flex: 1;
  justify-content: center;
}

.ticket-information {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

#ticket-admin-information {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ticket-form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
  flex: 1;
  height: 100%;
}

#ticket-buttons-container {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.ticket-form-header {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Noto sans JP';
}

.address-line {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.short-line {
  max-width: 30%;
}

/* .validation-text {
  position: absolute;
  bottom: -16px;
  right: 0;
  z-index: 2;
  font-size: 11px;
  color: var(--color-highlight);
  pointer-events: none;
} */
</style>