<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { useI18n } from 'vue-i18n'
import { PRIVILEGES } from '@/constants/privileges'
import { splitPhoneNumber, joinPhoneNumber } from '@/utils/phoneNumber'
import { useUserStore } from '@/stores/userStore'
import { updateUser } from '@/services/usersApi'

import RouteInfo from '@/components/common/RouteInfo.vue'
import PrivilegedDataTable from '@/components/graphic-items/PrivilegedDataTable.vue'
import SearchInput from '@/components/user-input/SearchInput.vue'
import SearchDropdown from '@/components/user-input/SearchDropdown.vue'
import LoaderButton from '@/components/buttons/LoaderButton.vue'
import ValidatedPhoneInput from '@/components/user-input/ValidatedPhoneInput.vue'
import TextInput from '@/components/user-input/TextInput.vue'

const { t } = useI18n()
const userStore = useUserStore()

const searchInput = ref('')
const itemsSelected = ref([])
const loading = ref(false)
const buttonHover = ref(false)

const expandedUserDrafts = reactive({})

const columns = computed(() => {
  return [
    { text: 'First name', value: 'firstName', sortable: true },
    { text: 'Last name', value: 'lastName', sortable: true },
    { text: 'E-mail', value: 'email', sortable: true },
    { text: 'Phone', value: 'phoneNumber', sortable: true },
    { text: 'Role', value: 'roles', sortable: true }
  ]
})

function formatRoleName(roleName) {
  if (!roleName) return ''
  return roleName.replace(/^ROLE_/, '')
              .toLowerCase()
              .replace(/^\w/, c => c.toUpperCase())
}

const items = computed(() => userStore.users)

const roles = [
  { label: t('user.roleAdminText'), role: 'ROLE_ADMIN' },
  { label: t('user.roleEngineerText'), role: 'ROLE_ENGINEER' },
  { label: t('user.roleUserText'), role: 'ROLE_USER' }
]

function getUserDraft(user) {
  if (!expandedUserDrafts[user.id]) {
    const primaryRole = user.roles?.[0]?.name || ''
    const { countryCode, localNumber } = splitPhoneNumber(user.phoneNumber || '')

    expandedUserDrafts[user.id] = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneCountryCode: countryCode || '',
      phoneLocal: localNumber || '',
      roleName: primaryRole
    }
  }

  return expandedUserDrafts[user.id]
}

function onClickUserRow(item) {
  console.log(item)
}

async function handleBulkDelete() {
  if (!itemsSelected.value.length) return
  for (const item of itemsSelected.value) {
    // await deleteUser(item.id)

    console.log(item)
  }
  itemsSelected.value = []

  // userStore.fetchAll()
}

async function handleUpdateUser(user) {
  const draft = getUserDraft(user)
  const id = user.id

  const payload = {
    firstName: draft.firstName,
    lastName: draft.lastName,
    phoneNumber: joinPhoneNumber(draft.phoneCountryCode, draft.phoneLocal),
    roles: [draft.roleName]
  }

  try {
    loading.value = true
    await updateUser(id, payload)
    await userStore.fetchAll()
  } catch (error) {
    console.error('Failed to update user', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  userStore.fetchAll()
})
</script>

<template>
  <div class="dashboard-view-wrapper">
    <div class="dashboard-header-items">
      <RouteInfo />

      <div class="dashboard-button-container">
          <AnimatePresence>
            <motion.button
              v-if="itemsSelected.length > 0"
              class="dashboard-header-button"
              type="button"
              :disabled="loading"
              :aria-busy="loading ? 'true' : 'false'"
              @mouseenter="buttonHover = true"
              @mouseleave="buttonHover = false"
              :initial="{ opacity: 0, scale: 0.9 }"
              :animate="{ opacity: 1, scale: 1 }"
              :exit="{ opacity: 0, scale: 0.9 }"
              :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
              :whileHover="{ scale: 1.05 }"
              @click="handleBulkDelete"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
              >
                <path
                  d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path d="M9.5 11L10 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path d="M14.5 11L14 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  
                <motion.g
                  :initial="{ rotate: 0, transformOrigin: '12px 6px' }"
                  :animate="buttonHover ? { rotate: -25, x: -4, y: -2 } : { rotate: 0 }"
                  :exit="{ rotate: 0 }"
                  :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
                >
                  <path
                    d="M20.5001 6H3.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                  <path
                    d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                </motion.g>
              </svg>
              <span>{{ t('project.deleteProjectsText') }}</span>
            </motion.button>
          </AnimatePresence>
        </div>
    </div>

    <div class="user-layout">
      <div id="user-filter-bar">
        <SearchInput :placeholder="t('project.searchProjectText')" variant="standalone" v-model="searchInput" />
      </div>

      <PrivilegedDataTable
        :headers="columns"
        :items="items"
        :search-value="searchInput"
        :rows-per-page="10"
        :theme-color="'var(--color-highlight)'"
        header-class-name="table-header"
        table-class-name="data-table"
        header-text-direction="center"
        body-text-direction="center"
        v-model:items-selected="itemsSelected"
        buttons-pagination
        @click-row="onClickUserRow"
        :privilege-key="PRIVILEGES.MODIFY_USERS"
      >
        <template #item-roles="{ roles }">
          <span>{{ formatRoleName(roles[0]?.name) }}</span>
        </template>

        <template #expand="user">
          <div class="row-expand-container">
            <div class="user-expand-section">
              <span class="user-expand-header">
                {{ t('user.adjustHeaderText') }}
              </span>

              <div class="user-expand-form">
                <div class="user-expand-field">
                  <TextInput
                    :id="`firstName-${user.id}`"
                    :placeholder="t('user.firstNameLabelText')"
                    v-model="getUserDraft(user).firstName"
                  />

                  <TextInput
                    :id="`lastName-${user.id}`"
                    :placeholder="t('user.lastNameLabelText')"
                    v-model="getUserDraft(user).lastName"
                  />
                </div>

                <div class="user-expand-field">
                  <ValidatedPhoneInput
                    class="user-expand-phone-input"
                    :id="`phoneNumber-${user.id}`"
                    v-model="getUserDraft(user).phoneLocal"
                    :country-code="getUserDraft(user).phoneCountryCode"
                    :placeholder="t('auth.phone')"
                  />
                </div>

                <div class="user-expand-field">
                  <SearchDropdown
                    :items="roles"
                    :model-value="getUserDraft(user).roleName"
                    value-key="role"
                    label-key="label"
                    :icon-indent="12"
                    @update:modelValue="value => (getUserDraft(user).roleName = value)"
                  />
                </div>
              </div>

              <div class="user-expand-actions">
                <LoaderButton
                  :loading="false"
                  :label="t('user.saveChangesText')"
                  @click.stop="handleUpdateUser(user)"
                />
              </div>
            </div>
          </div>
        </template>

        <template #empty-message>
          <span class="ticket-no-data">{{ t('ticket.noDataFoundText') }}</span>
        </template>
      </PrivilegedDataTable>
    </div>
  </div>
</template>

<style>
.user-layout {
  flex: 1;
  background-color: var(--color-menu-background);
  margin: 12px;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

#user-filter-bar {
  display: flex;
  flex-direction: row;
  overflow: visible;
  position: relative;
}


.row-expand-container {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  cursor: default;
  gap: 12px;
  padding: 12px;
  background-color: var(--color-menu-background);
}

.user-expand-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  border-radius: 8px;
}

.user-expand-header {
  font-size: 16px;
  font-weight: 700;
  font-family: 'Noto sans JP';
  color: var(--color-text);
}

.user-expand-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.user-expand-field {
  display: flex;
  flex-direction: row;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.user-expand-actions {
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 12px;
}
</style>