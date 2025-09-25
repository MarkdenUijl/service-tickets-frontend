<script setup>
import RouteInfo from '@/components/common/RouteInfo.vue'
import api from '@/utils/api'
import { ref } from 'vue'
import SearchBar from '@/components/user-input/SearchBar.vue'
import { useI18n } from 'vue-i18n'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'

const loading = ref(false)
const searchInput = ref('')
const { t } = useI18n();

const handleButtonClick = async () => {
  if (loading.value) return // Guard against double submits
  loading.value = true

  try {
    const response = await api.get('/serviceTickets');

    console.log(response)
  } catch (error) {
    const status = error?.response?.status

    console.log(status)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="dashboard-view-wrapper">
    <div class="dashboard-header-items">
      <RouteInfo />
    </div>

    <div class="ticket-layout">
      <div id="ticket-filter-bar">
        <button id="ticket-filter-button">
          <SvgIcon name="filter-icon" height="20px" width="20px"/>
          <span>{{ t('ticket.filterButtonText') }}</span>
        </button>
        <SearchBar variant="inline" v-model="searchInput"/>
      </div>
      <button @click="handleButtonClick">CLICK ME</button>
    </div>
  </div>
</template>

<style>
.ticket-layout {
  flex: 1;
  background-color: var(--color-menu-background);
  margin: 12px;
  padding: 24px;
  border-radius: 12px;
}

#ticket-filter-bar {
  display: flex;
  flex-direction: row;
}

#ticket-filter-button {
  width: 120px;
  border-radius: 4px 0 0 4px;
  border: 1px solid var(--color-subtext);
  border-right: none;
  cursor: pointer;
  color: var(--color-text);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding-left: 12px;
}

#ticket-filter-button span {
  font-size: 13px;
  font-weight: 700;
}
</style>