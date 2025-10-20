<script setup>
import TicketStatusPill from '@/components/graphic-items/TicketStatusPill.vue'
import { formatIsoDate } from '@/utils/formatIsoDate'

defineProps({
  tickets: {
    type: Array,
    required: true
  },
  emptyText: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="recent-tickets-wrapper">
    <div v-if="tickets.length">
      <ul class="ticket-list">
        <li
          v-for="ticket in tickets"
          :key="ticket.id"
          class="ticket-list-item"
        >
          <div class="ticket-info">
            <router-link
              :to="`/dashboard/tickets/${ticket.id}`"
              class="ticket-link"
            >
              {{ ticket.name }}
            </router-link>
            <span class="ticket-date">{{ formatIsoDate(ticket.creationDate).date }}</span>
          </div>

          <TicketStatusPill :status="ticket.status" size="small" />
        </li>
      </ul>
    </div>
    <p v-else class="no-tickets-text">{{ emptyText }}</p>
  </div>
</template>

<style scoped>
.recent-tickets-wrapper {
  display: flex;
  flex-direction: column;
}

.ticket-list {
  list-style: none;
  margin: 0;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
}

.ticket-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  border-bottom: 1px solid var(--color-subtext);
}

.ticket-list-item:last-child {
  border-bottom: none;
}

.ticket-link {
  font-weight: 500;
  font-size: 12px;
  max-width: 180px;
  color: var(--color-text);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ticket-link:hover {
  color: var(--color-highlight);
}

.no-tickets-text {
  font-size: 12px;
  color: var(--color-subtext);
  font-style: italic;
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.ticket-date {
  font-size: 10px;
  color: var(--color-subtext);
}
</style>