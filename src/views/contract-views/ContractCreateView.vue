<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import RouteInfo from '@/components/common/RouteInfo.vue'
import SearchDropdown from '@/components/user-input/SearchDropdown.vue'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'
import LoaderButton from '@/components/buttons/LoaderButton.vue'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const hasCreationError = ref(false)
const creationErrorTextKey = ref('')

// Project data for display (not editable)
const project = ref(null)

// Core form data (hours, not minutes)
const contractForm = reactive({
  projectId: null,
  type: '',
  contractTime: null,
  startDate: ''
})

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

onMounted(async () => {
  const projectIdFromRoute = route.query.projectId

  if (!projectIdFromRoute) {
    // No project passed, fall back to projects overview
    router.push({ name: 'projects' })
    return
  }

  const numericId = Number(projectIdFromRoute)
  contractForm.projectId = numericId

  try {
    const { data } = await api.get(`/projects/${numericId}`)
    project.value = data
  } catch (err) {
    console.error('Failed to load project for contract creation:', err)
    // If we cannot load the project, it is safer to go back
    router.push({ name: 'projects' })
  }
})

// Basic “all fields filled” validation
const isFormValid = computed(() => {
  return (
    !!contractForm.projectId &&
    !!contractForm.type &&
    !!contractForm.contractTime &&
    !!contractForm.startDate
  )
})

// Reset errors when form changes
watch(
  () => ({ ...contractForm }),
  () => {
    hasCreationError.value = false
    creationErrorTextKey.value = ''
  },
  { deep: true }
)

// Submit contract creation
async function handleSubmit() {
  if (!isFormValid.value) {
    console.log('FORM IS NOT VALID')
    hasCreationError.value = true
    creationErrorTextKey.value = 'creationContractValidationText'
    return
  }

  loading.value = true
  hasCreationError.value = false
  creationErrorTextKey.value = ''

  try {
    await api.post('/serviceContracts', {
      projectId: contractForm.projectId,
      type: contractForm.type,
      contractTime: contractForm.contractTime * 60,
      startDate: contractForm.startDate
    })

    // On success, go back to the project detail
    router.push(`/projects/${contractForm.projectId}`)
  } catch (err) {
    console.error('Error creating contract:', err)
    hasCreationError.value = true

    if (err.status === 409) {
      creationErrorTextKey.value = 'creationContractExistsText'
    } else {
      creationErrorTextKey.value = 'creationContractGenericErrorText'
    }
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  if (contractForm.projectId) {
    router.push({ name: 'project-detail', params: { id: contractForm.projectId } })
  } else {
    router.push({ name: 'projects' })
  }
}
</script>

<template>
  <div class="dashboard-view-wrapper">
    <div class="dashboard-header-items">
      <RouteInfo />
    </div>

    <div class="contract-create-form-wrapper">
      <form class="contract-create-form" @submit.prevent="handleSubmit">
        <div class="contract-form-items">
          <div class="contract-form-section">
            <span class="contract-form-header">
              {{ t('contract.creationContractDetailsText') }}
            </span>

            <!-- Linked project (read-only) -->
            <div class="linked-project-block" v-if="project">
              <span class="linked-project-label">
                {{ t('contract.creationLinkedProjectLabelText') }}
              </span>
              <span class="linked-project-value">
                {{ project.name }} – {{ project.city }}, {{ project.zipCode }}
              </span>
            </div>

            <div class="contract-expand-grid">
              <!-- Contract type -->
              <div class="contract-expand-field">
                <label class="contract-expand-label" for="contractType">
                  {{ t('contract.creationContractTypeLabelText') }}
                </label>
                
                <SearchDropdown
                  :items="contractTypeItems"
                  :model-value="contractForm.type"
                  value-key="value"
                  label-key="label"
                  :icon-indent="12"
                  @update:modelValue="value => (contractForm.type = value)"
                />
              </div>

              <!-- Contract hours -->
              <div class="contract-expand-field">
                <label class="contract-expand-label" for="contractHours">
                  {{ t('contract.creationContractHoursLabelText') }}
                </label>

                <SearchDropdown
                  :items="contractHoursItems"
                  :model-value="contractForm.contractTime"
                  value-key="value"
                  label-key="label"
                  :icon-indent="12"
                  @update:modelValue="value => (contractForm.contractTime = value)"
                />
              </div>

              <!-- Start date -->
              <div class="contract-expand-field">
                <label class="contract-expand-label" for="startDate">
                  {{ t('contract.creationStartDateLabelText') }}
                </label>
                <div class="contract-expand-input-wrapper-date">
                  <input
                    id="startDate"
                    v-model="contractForm.startDate"
                    type="date"
                    class="contract-expand-input"
                  />
                  <SvgIcon
                    class="contract-calendar-icon"
                    name="calendar-icon"
                    height="16px"
                    width="16px"
                  />
                </div>
              </div>
            </div>

            <span v-if="hasCreationError" class="form-warning-text">
              {{ t(`contract.${creationErrorTextKey}`) }}
            </span>
            <!-- Buttons -->
            <div id="contract-buttons-container">
              <LoaderButton
                :loading="loading"
                :label="t('contract.createContractText')"
                type="submit"
              />
              <LoaderButton
                :label="t('base.cancelText')"
                type="button"
                @click="handleCancel"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.contract-create-form-wrapper {
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

.contract-create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  flex: 1;
  align-items: center;
}

.contract-form-items {
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
  flex: 1;
  justify-content: flex-start;
}

.contract-form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
  flex: 1;
  height: 100%;
}

.contract-form-header {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Noto sans JP';
}

.linked-project-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.linked-project-label {
  font-size: 16px;
  color: var(--color-subtext);
  font-weight: 700;
}

.linked-project-value {
  font-size: 13px;
  font-weight: 500;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 12px;
  color: var(--color-subtext);
}

#contract-buttons-container {
  margin-top: 16px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.form-warning-text {
  color: var(--color-highlight);
  padding-left: 4px;
  font-size: 12px;
}

.contract-expand-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px 16px;
  margin-top: 12px;
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
</style>