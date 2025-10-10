<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import RouteInfo from '@/components/common/RouteInfo.vue'
import ValidatedInput from '@/components/user-input/ValidatedInput.vue'
import api from '@/services/api'
import { motion } from 'motion-v'
import SearchDropdown from '@/components/user-input/SearchDropdown.vue'
import LoaderButton from '@/components/buttons/LoaderButton.vue'
import VisualSeparator from '@/components/graphic-items/VisualSeparator.vue'

const router = useRouter()
const loading = ref(false)
const projects = ref([])

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

// Validation rules
const isNameValid = computed(() => ticketData.name.trim().length > 10 || ticketData.name.length === 0)
const isStreetValid = computed(() => ticketData.street.trim().length > 0 || ticketData.street.length === 0) // build proper validator
const isHouseNumberValid = computed(() => ticketData.houseNumber.trim().length > 0 || ticketData.houseNumber.length === 0) // needs to be a number
const isZipCodeValid = computed(() => ticketData.zipCode.trim().length > 0 || ticketData.zipCode.length === 0) // needs to also follow 4 digits and 2 capital letters, with a space between like '1234 AB'
const isCityValid = computed(() => ticketData.city.trim().length > 0 || ticketData.city.length === 0)

// Description textarea floating label states
const isDescriptionFocused = ref(false)
const handleFocus = () => (isDescriptionFocused.value = true)
const handleBlur = () => (isDescriptionFocused.value = false)
const isDescriptionFilled = computed(() => isDescriptionFocused.value || ticketData.description.trim().length > 0)

// New file upload ref and handler
const selectedFiles = ref([])
const isDragging = ref(false)

function handleDrop(event) {
  event.preventDefault()
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  const validFiles = []
  for (const file of files) {
    if (file.size > 8 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds the 8MB limit and will be skipped.`)
      continue
    }
    validFiles.push(file)
  }
  selectedFiles.value = validFiles
}

function handleDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}


function onFileSelected(event) {
  const files = Array.from(event.target.files)
  const validFiles = []

  for (const file of files) {
    if (file.size > 8 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds the 8MB limit and will be skipped.`)
      continue
    }
    validFiles.push(file)
  }

  selectedFiles.value = validFiles
}

function removeFile(index) {
  selectedFiles.value.splice(index, 1)
}

// Fetch projects from backend
async function fetchProjects() {
  try {
    const response = await api.get('/projects')
    projects.value = response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
  }
}

function buildProjectQueryParams() {
  const params = {}
  if (ticketData.street.trim() !== '') {
    params.street = ticketData.street.trim()
  }
  if (ticketData.houseNumber.trim() !== '') {
    if (/^\d+$/.test(ticketData.houseNumber.trim())) {
      params.houseNumber = Number(ticketData.houseNumber.trim())
    }
  }
  if (ticketData.zipCode.trim() !== '') {
    params.zipCode = ticketData.zipCode.trim()
  }
  if (ticketData.city.trim() !== '') {
    params.city = ticketData.city.trim()
  }
  return params
}

async function fetchProjectsByAddress() {
  const params = buildProjectQueryParams()
  try {
    const response = await api.get('/projects', { params })
    projects.value = response.data
    if (projects.value.length === 1) {
      ticketData.projectId = projects.value[0].id
    } else if (projects.value.length === 0) {
      ticketData.projectId = ''
    } else {
      const ids = projects.value.map(p => p.id)
      if (!ids.includes(ticketData.projectId)) {
        ticketData.projectId = ''
      }
    }
  } catch (error) {
    console.error('Error fetching projects by address:', error)
  }
}

// Auto-fill address details when project is selected
watch(() => ticketData.projectId, (newProjectId) => {
  const project = projects.value.find(p => p.id === newProjectId)
  if (project) {
    Object.assign(ticketData, {
      street: String(project.street || ''),
      houseNumber: String(project.houseNumber || ''),
      zipCode: String(project.zipCode || ''),
      city: String(project.city || '')
    })
  } else {
    Object.assign(ticketData, {
      street: '',
      houseNumber: '',
      zipCode: '',
      city: ''
    })
  }
})

// Submit ticket creation form
async function handleSubmit() {
  const { name, type, description, projectId } = ticketData

  if (!name || !type || !description || !projectId) return

  const ticketPayload = {
    name: name,
    status: 'open',
    type: type,
    description: description,
    projectId: projectId
  }

  loading.value = true

  const response = await api.post('/serviceTickets', ticketPayload)

  const createdTicketId = response.data.id

  if (selectedFiles.value.length > 0) {
    const formData = new FormData()
    selectedFiles.value.forEach(file => formData.append('files', file))

    try {
      await api.post(`/serviceTickets/${createdTicketId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      router.push('/dashboard/tickets')
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      loading.value = false
    }
  }
}

const ticketTypes = [
  {
    name: 'Hardware',
    type: 'HARDWARE'
  },
  {
    name: 'Software',
    type: 'SOFTWARE'
  },
  {
    name: 'Question',
    type: 'QUESTION'
  },
  {
    name: 'Change',
    type: 'CHANGE'
  },
  {
    name: 'Unknown',
    type: 'UNKNOWN'
  }
]

onMounted(fetchProjects)
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
  
            <div class="textarea-field">
              <motion.label class="textarea-placeholder" for="description" :animate="{
                top: isDescriptionFilled ? -13 : 12,
                left: isDescriptionFilled ? 10 : 16,
                fontSize: isDescriptionFilled ? '12px' : '16px',
                color: isDescriptionFocused ? 'var(--color-text)' : 'var(--color-subtext)'
              }" :transition="{ type: 'spring', stiffness: 300, damping: 20 }">
                Description
              </motion.label>
  
              <textarea id="description" v-model="ticketData.description" rows="5" required class="text-area-styled"
                @focus="handleFocus" @blur="handleBlur"></textarea>
            </div>
  
  
            <div class="file-upload-field">
              <!-- <label for="fileUpload">Attach files (max 8MB):</label>
              <input id="fileUpload" type="file" multiple @change="onFileSelected" /> -->
                <div
                class="file-dropzone"
                :class="{ dragging: isDragging }"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop="handleDrop"
                @click="$refs.fileInput.click()"
              >
                <p>Click here or drag files to upload</p>
                <input
                  ref="fileInput"
                  id="fileUpload"
                  type="file"
                  multiple
                  @change="onFileSelected"
                  class="hidden-file-input"
                />
              </div>

              <ul v-if="selectedFiles.length" class="file-list">
                <li v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                  <span class="file-name">{{ file.name }}</span>
                  <button type="button" class="remove-file-btn" @click="removeFile(index)">
                    x
                  </button>
                </li>
              </ul>
            </div>
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

.text-area-styled {
  height: 100%;
  width: 100%;
  min-height: 120px;
  border: 1px solid var(--color-subtext);
  background-color: var(--color-menu-background);
  color: var(--color-subtext);
  border-radius: 4px;
  padding: 16px;
  font-size: 16px;
  font-family: 'Ubuntu', sans-serif;
  outline: none;
  resize: none;
}

.text-area-styled:focus {
  border-color: var(--color-text);
  color: var(--color-text);
}

.textarea-field {
  position: relative;
  width: 100%;
  display: flex;
  flex: 1;
  font-family: 'Ubuntu', sans-serif;
}

.textarea-placeholder {
  pointer-events: none;
  position: absolute;
  padding: 3px;
  z-index: 1;
  color: var(--color-subtext);
  background-color: var(--color-menu-background);
  left: 16px;
  top: 16px;
  font-size: 16px;
  width: min-content;
}

.file-upload-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-secondary);
  height: 24px;
  border-radius: 12px;
  padding: 0 12px;
  font-size: 10px;
  color: var(--color-highlight);
  width: 140px;
  /* max-width: 160px; */
}

.file-name {
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-file-btn {
  color: var(--color-highlight);
  cursor: pointer;
  font-size: 12px;
}


.file-dropzone {
  border: 2px dashed var(--color-subtext);
  border-radius: 6px;
  padding: 24px;
  text-align: center;
  background-color: var(--color-menu-background);
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
  color: var(--color-subtext);
  font-size: 14px;
}

.file-dropzone.dragging {
  border-color: var(--color-highlight);
  background-color: var(--color-secondary);
  color: var(--color-highlight);
}

.hidden-file-input {
  display: none;
}
</style>