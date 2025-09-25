<script setup>
import RouteInfo from '@/components/common/RouteInfo.vue'
import api from '@/utils/api'
import { ref } from 'vue'

const loading = ref(false)

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
            <button @click="handleButtonClick">CLICK ME</button>
        </div>
    </div>
</template>

<style>
.ticket-layout {
    flex: 1;
    background-color: var(--color-menu-background);
    margin: 12px;
    border-radius: 12px;
}
</style>