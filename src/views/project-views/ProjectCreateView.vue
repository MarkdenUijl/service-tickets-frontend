<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import RouteInfo from '@/components/common/RouteInfo.vue'
import ValidatedInput from '@/components/user-input/ValidatedInput.vue'
import api from '@/services/api'
import LoaderButton from '@/components/buttons/LoaderButton.vue'
import { useProjectValidation } from '@/composables/useProjectValidation'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)

const hasCreationError = ref(false)
const creationErrorTextKey = ref('')

// Core form data
const projectData = reactive({
  name: '',
  city: '',
  zipCode: '',
  street: '',
  houseNumber: ''
})

// Composables
const {
  errors,
  isNameValid,
  isCityValid,
  isZipCodeValid,
  isStreetValid,
  isHouseNumberValid,
  validateAll
} = useProjectValidation(projectData)

// Submit project creation form
async function handleSubmit() {
  if (!validateAll()) return

  let { name, city, zipCode, street, houseNumber } = projectData

  loading.value = true
  try {
    const { data } = await api.post('/projects', {
      name,
      city,
      zipCode,
      street,
      houseNumber
    })

    router.push('/dashboard/projects')
  } catch (err) {
    console.error('Error creating ticket:', err)

    if (err.status === 409) {
      hasCreationError.value = true
      creationErrorTextKey.value = 'creationProjectExistsText'
    }
  } finally {
    loading.value = false
  }
}

const handleProjectCancel = () => {
  router.push('/dashboard/projects')
}

watch(
  () => projectData,
  () => {
    hasCreationError.value = false
    creationErrorTextKey.value = ''
  },
  { deep: true }
)
</script>

<template>
  <div class="dashboard-view-wrapper">
    <div class="dashboard-header-items">
      <RouteInfo />
    </div>

    <div class="project-create-form-wrapper">
      <form class="project-create-form" @submit.prevent="handleSubmit">
        <div class="project-form-items">
          <div class="project-form-section">
            <span class="project-form-header">{{ t('project.creationProjectDetailsText') }}</span>
            
            <ValidatedInput
              id="name"
              v-model="projectData.name"
              type="text"
              :placeholder="t('project.creationProjectNameText')"
              :isValid="isNameValid && errors.name === '' && !hasCreationError"
              :validationText="hasCreationError ? ' ' : errors.name"
            />

            <div class="address-line">
              <ValidatedInput
                id="city"
                v-model="projectData.city"
                type="text"
                :placeholder="t('project.creationProjectCityText')"
                :isValid="isCityValid && errors.city === '' && !hasCreationError"
                :validationText="hasCreationError ? ' ' : errors.city"
              />

              <ValidatedInput
                id="zipcode"
                v-model="projectData.zipCode"
                type="text"
                :placeholder="t('project.creationProjectZipCodeText')"
                :isValid="isZipCodeValid && errors.zipCode === '' && !hasCreationError"
                :validationText="hasCreationError ? ' ' : errors.zipCode"
              />
            </div>

            <div class="address-line">
              <ValidatedInput
                id="street"
                v-model="projectData.street"
                type="text"
                :placeholder="t('project.creationProjectStreetText')"
                :isValid="isStreetValid && errors.street === '' && !hasCreationError"
                :validationText="hasCreationError ? ' ' : errors.street"
              />

              <ValidatedInput
                id="houseNumber"
                class="short-line"
                v-model="projectData.houseNumber"
                type="text"
                :placeholder="t('project.creationProjectHouseNumberText')"
                :isValid="isHouseNumberValid && errors.houseNumber === '' && !hasCreationError"
                :validationText="hasCreationError ? ' ' : errors.houseNumber"
              />
              
              <span v-if="hasCreationError" class="form-warning-text">
                {{ t(`project.${creationErrorTextKey}`) }}
              </span>
            </div>

            <div id="project-buttons-container">
              <LoaderButton :loading="loading" :label="t('project.creationCreateProjectText')" type="submit" />
              <LoaderButton :label="t('base.cancelText')" @click="handleProjectCancel" />
            </div>
          </div>
        </div>
      </form>

    </div>
  </div>
</template>

<style scoped>
.project-create-form-wrapper {
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

.project-create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  flex: 1;
  align-items: center;
}

.project-form-items {
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
  flex: 1;
  justify-content: flex-start;
}

#ticket-admin-information {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
  flex: 1;
  height: 100%;
}

#project-buttons-container {
  margin-top: 16px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.project-form-header {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Noto sans JP';
}

.address-line {
  display: flex;
  flex-direction: row;
  gap: 16px;
  position: relative;
}

.short-line {
  max-width: 30%;
}

.form-warning-text {
  position: absolute;
  color: var(--color-highlight);
  padding-left: 4px;
  font-size: 12px;
  bottom: -20px;
  right: 0px;
}
</style>