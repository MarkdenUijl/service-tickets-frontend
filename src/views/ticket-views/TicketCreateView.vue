<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import RouteInfo from '@/components/common/RouteInfo.vue'
import ValidatedInput from '@/components/user-input/ValidatedInput.vue'
import api from '@/services/api'
import { motion } from 'motion-v'
import SearchDropdown from '@/components/user-input/SearchDropdown.vue'
import LoaderButton from '@/components/buttons/LoaderButton.vue'
import VisualSeparator from '@/components/graphic-items/VisualSeparator.vue'
import { useProjectLookup } from '@/composables/useProjectLookup'
import { useTicketValidation } from '@/composables/useTicketValidation'
import TextArea from '@/components/user-input/TextArea.vue'
import FileDropzone from '@/components/user-input/FileDropzone.vue'

const router = useRouter()
const loading = ref(false)

// Core form data
const ticketData = reactive({
  name: '',
  type: '',
  description: '',
  projectId: '',
  street: '',
  houseNumber: '',
  zipCode: '',
  city: ''
})

// Composables
const { isNameValid, isStreetValid, isHouseNumberValid, isZipCodeValid, isCityValid } =
  useTicketValidation(ticketData)

const { projects, fetchProjects, fetchProjectsByAddress, autofillAddress } =
  useProjectLookup(ticketData)
  
const selectedFiles = ref([])

// Autofill project details when selection changes
watch(() => ticketData.projectId, autofillAddress)

// Load projects on mount
onMounted(fetchProjects)

// Submit ticket creation form
async function handleSubmit() {
  const { name, type, description, projectId } = ticketData
  if (!name || !type || !description || !projectId) return

  loading.value = true
  try {
    const { data } = await api.post('/serviceTickets', {
      name,
      status: 'open',
      type,
      description,
      projectId
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

const ticketTypes = [
  { name: 'Hardware', type: 'HARDWARE' },
  { name: 'Software', type: 'SOFTWARE' },
  { name: 'Question', type: 'QUESTION' },
  { name: 'Change', type: 'CHANGE' },
  { name: 'Unknown', type: 'UNKNOWN' }
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
            <span class="ticket-form-header">Fill in ticket details</span>
  
            <div id="ticket-information">
              <ValidatedInput id="name" v-model="ticketData.name" type="text" placeholder="Ticket name"
                :isValid="isNameValid" validationText="Name must be at least 4 characters long" />
  
              <SearchDropdown class="short-line" v-model="ticketData.type" :items="ticketTypes"
                placeholder="Type" label-key="name" value-key="type" :iconIndent="24"
                :dropdownHeight="60" />
            </div>

            <TextArea
              v-model="ticketData.description"
              label="Description"
              :rows="5"
              required
            />
  
            <FileDropzone
              v-model="selectedFiles"
              :maxFiles="8"
            />
          </div>
  
          <VisualSeparator orientation="vertical"/>
  
          <div class="ticket-form-section">
            <span class="ticket-form-header">Link your project</span>
  
            <SearchDropdown v-model="ticketData.projectId" :items="projects" placeholder="Select a project"
              label-key="name" value-key="id" :iconIndent="24" :dropdownHeight="60" />
  
            <VisualSeparator separatorText="or" />
  
            <div class="address-line">
              <ValidatedInput id="street" v-model="ticketData.street" type="text" placeholder="Street name"
                :isValid="isStreetValid" validationText="Street is required" @blur="fetchProjectsByAddress" />
  
              <ValidatedInput id="houseNumber" class="short-line" v-model="ticketData.houseNumber" type="text"
                placeholder="Number" :isValid="isHouseNumberValid" validationText="House number is required"
                @blur="fetchProjectsByAddress" />
            </div>
  
            <div class="address-line">
              <ValidatedInput id="zipcode" class="short-line" v-model="ticketData.zipCode" type="text"
                placeholder="Zip Code" :isValid="isZipCodeValid" validationText="Zip code is required"
                @blur="fetchProjectsByAddress" />
  
              <ValidatedInput id="city" v-model="ticketData.city" type="text" placeholder="City" :isValid="isCityValid"
                validationText="City is required" @blur="fetchProjectsByAddress" />
            </div>
          </div>
        </div>
        
        <LoaderButton :loading="loading" label="Create ticket" type="submit" />
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

#ticket-information {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.ticket-form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 450px;
  flex: 1;
  height: 100%;
}

.ticket-form-header {
  font-size: 20px;
  font-weight: 700;
}

.address-line {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.short-line {
  max-width: 30%;
}
</style>