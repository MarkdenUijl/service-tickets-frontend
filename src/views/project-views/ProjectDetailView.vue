<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isContractCurrentlyValid, getRemainingContractTime, getContractTypeKey } from '@/utils/contractHelpers'
import { safeApiCall } from '@/utils/safeApiCall'
import api from '@/services/api'
import RouteInfo from '@/components/common/RouteInfo.vue'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const { t } = useI18n()

// Core state
const projectData = ref(null)
const isLoadingProject = ref(true)
const hasLoadError = ref(false)

async function loadProject() {
  isLoadingProject.value = true
  hasLoadError.value = false
  
  const projectLoaded = await safeApiCall(
    async () => {
      const project = await api.get(`/projects/${route.params.id}`)
      projectData.value = project

      return project
    },
    'Failed to fetch project details'
  )

  if (!projectLoaded) hasLoadError.value = true
  isLoadingProject.value = false
}

watch(() => route.params.id, loadProject, { immediate: true })


const serviceContract = computed(() => projectData.value?.serviceContract || null)
const isContractValid = computed(() => isContractCurrentlyValid(serviceContract.value))
const remainingContractMinutes = computed(() => getRemainingContractTime(serviceContract.value))
const contractTypeLabel = computed(() => t(getContractTypeKey(serviceContract.value)))
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
      <div>HELLO</div>
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
}
</style>