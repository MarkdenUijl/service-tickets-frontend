<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import RouteInfo from '@/components/common/RouteInfo.vue'
import ValidatedInput from '@/components/user-input/ValidatedInput.vue'
import api from '@/services/api'
import { motion } from 'motion-v'
import SearchDropdown from '@/components/user-input/SearchDropdown.vue'

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
const isNameValid = computed(() => ticketData.name.trim().length > 3 || ticketData.name.length === 0)
const isStreetValid = computed(() => ticketData.street.trim().length > 0 || ticketData.street.length === 0) // build proper validator
const isHouseNumberValid = computed(() => ticketData.houseNumber.trim().length > 0 || ticketData.houseNumber.length === 0) // needs to be a number
const isZipCodeValid = computed(() => ticketData.zipCode.trim().length > 0 || ticketData.zipCode.length === 0) // needs to also follow 4 digits and 2 capital letters, with a space between like '1234 AB'
const isCityValid = computed(() => ticketData.city.trim().length > 0 || ticketData.city.length === 0)

// Description textarea floating label states
const isDescriptionFocused = ref(false)
const handleFocus = () => (isDescriptionFocused.value = true)
const handleBlur = () => (isDescriptionFocused.value = false)
const isDescriptionFilled = computed(() => isDescriptionFocused.value || ticketData.description.trim().length > 0)

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
  try {
    await api.post('/serviceTickets', ticketPayload)

    router.push('/dashboard/tickets')
  } catch (error) {
    console.error('Error creating ticket:', error)
  } finally {
    loading.value = false
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

    <form class="ticket-create-form" @submit.prevent="handleSubmit">
      <div id="ticket-information">
        <ValidatedInput
          id="name"
          v-model="ticketData.name"
          type="text"
          placeholder="Ticket name"
          :isValid="isNameValid"
          validationText="Name must be at least 4 characters long"
        />

        <!-- <select id="type" v-model="ticketData.type" required>
          <option disabled value="">Select a ticket type</option>
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
          <option value="question">Question</option>
          <option value="change">Change</option>
          <option value="unknown">Unknown</option>
        </select> -->
        <SearchDropdown
          class="short-line"
          v-model="ticketData.type"
          :items="ticketTypes"
          placeholder="Select a ticket type"
          label-key="name"
          value-key="type"
          :iconIndent="24"
          :dropdownHeight="60"
        />
      </div>

      <div id="project-information">
        <div class="form-group">
          <!-- <label for="project">Project</label>
          <select id="project" v-model="ticketData.projectId" required>
            <option disabled value="">Select a project</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select> -->
          <SearchDropdown
            v-model="ticketData.projectId"
            :items="projects"
            placeholder="Select a project"
            label-key="name"
            value-key="id"
            :iconIndent="24"
            :dropdownHeight="60"
          />
        </div>
        
        <div class="address-line">
          <ValidatedInput
            id="street"
            v-model="ticketData.street"
            type="text"
            placeholder="Street name"
            :isValid="isStreetValid"
            validationText="Street is required"
            @blur="fetchProjectsByAddress"
          />

          <ValidatedInput
            id="houseNumber"
            class="short-line"
            v-model="ticketData.houseNumber"
            type="text"
            placeholder="House number"
            :isValid="isHouseNumberValid"
            validationText="House number is required"
            @blur="fetchProjectsByAddress"
          />
        </div>

        <div class="address-line">
          <ValidatedInput
            id="zipcode"
            class="short-line"
            v-model="ticketData.zipCode"
            type="text"
            placeholder="Zip Code"
            :isValid="isZipCodeValid"
            validationText="Zip code is required"
            @blur="fetchProjectsByAddress"
          />

          <ValidatedInput
            id="city"
            v-model="ticketData.city"
            type="text"
            placeholder="City"
            :isValid="isCityValid"
            validationText="City is required"
            @blur="fetchProjectsByAddress"
          />
        </div>
      </div>

      <div class="textarea-field">
        <motion.label
          class="textarea-placeholder"
          for="description"
          :animate="{
            top: isDescriptionFilled ? -13 : 12,
            left: isDescriptionFilled ? 10 : 16,
            fontSize: isDescriptionFilled ? '12px' : '16px',
            color: isDescriptionFocused ? 'var(--color-text)' : 'var(--color-subtext)'
          }"
          :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
        >
          Description
        </motion.label>

        <textarea
          id="description"
          v-model="ticketData.description"
          rows="5"
          required
          class="text-area-styled"
          @focus="handleFocus"
          @blur="handleBlur"
        ></textarea>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating...' : 'Create Ticket' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.ticket-create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  padding: 24px;
  background-color: var(--color-menu-background);
  border-radius: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 700;
  font-size: 18px;
}

#ticket-information {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

#project-information {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-line {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.short-line {
  max-width: 20%;
}

/* select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--color-subtext);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 16px;
} */

.text-area-styled {
  height: 120px;
  width: 100%;
  border: 1px solid var(--color-subtext);
  background-color: var(--color-menu-background);
  color: var(--color-subtext);
  border-radius: 4px;
  padding: 16px;
  font-size: 16px;
  font-family: 'Ubuntu', sans-serif;
  outline: none;
  transition: border-color 0.2s ease;
  resize: none;
}

.text-area-styled:focus {
  border-color: var(--color-text);
  color: var(--color-text);
}

.text-area-styled:-webkit-autofill {
  box-shadow: 0 0 0px 1000px var(--color-menu-background) inset;
  -webkit-text-fill-color: var(--color-subtext);
  transition: background-color 5000s ease-in-out 0s;
}

.text-area-styled:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--color-text);
}

.text-area-styled:-webkit-autofill:hover,
.text-area-styled:-webkit-autofill:focus {
  box-shadow: 0 0 0px 1000px var(--color-menu-background) inset;
}

.textarea-field {
  position: relative;
  width: 100%;
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

button {
  align-self: flex-start;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: var(--color-highlight);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

button[disabled] {
  opacity: 0.6;
  cursor: default;
}
</style>