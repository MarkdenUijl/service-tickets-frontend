<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import RouteInfo from '@/components/common/RouteInfo.vue'
import { motion, AnimatePresence } from 'motion-v'
import { useI18n } from 'vue-i18n'
import { PRIVILEGES } from '@/constants/privileges'
import { splitPhoneNumber, joinPhoneNumber } from '@/utils/phoneNumber'

import PrivilegedDataTable from '@/components/graphic-items/PrivilegedDataTable.vue'
import SearchInput from '@/components/user-input/SearchInput.vue'
import SearchDropdown from '@/components/user-input/SearchDropdown.vue'
import LoaderButton from '@/components/buttons/LoaderButton.vue'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'
import ValidatedPhoneInput from '@/components/user-input/ValidatedPhoneInput.vue'

const { t } = useI18n()

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

const items = [
    {
        "id": 1,
        "firstName": "Admin",
        "lastName": "Tester",
        "email": "admin@tester.nl",
        "phoneNumber": "+31612345678",
        "roles": [
            {
                "id": 1,
                "name": "ROLE_ADMIN",
                "privileges": [
                    {
                        "id": 451,
                        "name": "CAN_MODERATE_TICKET_RESPONSES_PRIVILEGE"
                    },
                    {
                        "id": 51,
                        "name": "CAN_MODIFY_CONTRACTS_PRIVILEGE"
                    },
                    {
                        "id": 1,
                        "name": "CAN_SEE_CONTRACTS_PRIVILEGE"
                    },
                    {
                        "id": 101,
                        "name": "CAN_SEE_PROJECTS_PRIVILEGE"
                    },
                    {
                        "id": 351,
                        "name": "CAN_MODERATE_SERVICE_TICKETS_PRIVILEGE"
                    },
                    {
                        "id": 251,
                        "name": "CAN_ACCESS_USERS_PRIVILEGE"
                    },
                    {
                        "id": 151,
                        "name": "CAN_MODIFY_PROJECTS_PRIVILEGE"
                    },
                    {
                        "id": 401,
                        "name": "CAN_MAKE_ENGINEER_RESPONSE_PRIVILEGE"
                    },
                    {
                        "id": 201,
                        "name": "CAN_SEE_USERS_PRIVILEGE"
                    },
                    {
                        "id": 301,
                        "name": "CAN_MODIFY_USERS_PRIVILEGE"
                    }
                ]
            }
        ],
        "tickets": []
    },
    {
        "id": 51,
        "firstName": "Engineer",
        "lastName": "Tester",
        "email": "engineer@tester.nl",
        "phoneNumber": "+31612345678",
        "roles": [
            {
                "id": 51,
                "name": "ROLE_ENGINEER",
                "privileges": [
                    {
                        "id": 1,
                        "name": "CAN_SEE_CONTRACTS_PRIVILEGE"
                    },
                    {
                        "id": 101,
                        "name": "CAN_SEE_PROJECTS_PRIVILEGE"
                    },
                    {
                        "id": 351,
                        "name": "CAN_MODERATE_SERVICE_TICKETS_PRIVILEGE"
                    },
                    {
                        "id": 251,
                        "name": "CAN_ACCESS_USERS_PRIVILEGE"
                    },
                    {
                        "id": 401,
                        "name": "CAN_MAKE_ENGINEER_RESPONSE_PRIVILEGE"
                    },
                    {
                        "id": 201,
                        "name": "CAN_SEE_USERS_PRIVILEGE"
                    }
                ]
            }
        ],
        "tickets": []
    },
    {
        "id": 101,
        "firstName": "User",
        "lastName": "Tester",
        "email": "user@tester.nl",
        "phoneNumber": "+31612345678",
        "roles": [
            {
                "id": 101,
                "name": "ROLE_USER",
                "privileges": [
                    {
                        "id": 201,
                        "name": "CAN_SEE_USERS_PRIVILEGE"
                    }
                ]
            }
        ],
        "tickets": [
            {
                "id": 1,
                "submittedBy": {
                    "id": 101,
                    "firstName": "User",
                    "lastName": "Tester",
                    "email": "user@tester.nl",
                    "phoneNumber": "+31612345678"
                },
                "name": "Probleem in amsterdam",
                "status": "CLOSED",
                "type": "SOFTWARE",
                "source": "PHONE",
                "priority": "LOW",
                "description": "Het gaat hier helemaal mis!",
                "responses": [
                    {
                        "id": 1,
                        "submittedBy": {
                            "id": 1,
                            "firstName": "Admin",
                            "lastName": "Tester",
                            "email": "admin@tester.nl",
                            "phoneNumber": "+31612345678"
                        },
                        "response": "<p>Ik ga hier iets schrijven en dit oplossen voor je!</p>",
                        "creationDate": "2025-12-07T17:01:19Z",
                        "engineerResponse": true
                    },
                    {
                        "id": 2,
                        "submittedBy": {
                            "id": 1,
                            "firstName": "Admin",
                            "lastName": "Tester",
                            "email": "admin@tester.nl",
                            "phoneNumber": "+31612345678"
                        },
                        "response": "<p>Ik sluit het ticket</p>",
                        "creationDate": "2025-12-09T13:40:13Z",
                        "engineerResponse": true
                    }
                ],
                "minutesSpent": 11,
                "creationDate": "2025-12-07T17:00:49Z",
                "lastUpdated": "2025-12-09T13:40:13Z",
                "closingDate": "2025-12-09T13:40:15Z",
                "files": {},
                "project": {
                    "id": 1,
                    "name": "Amsterdam Tower",
                    "serviceContract": {
                        "id": 602,
                        "contractTime": 480,
                        "usedTime": 11,
                        "startDate": "2025-12-07",
                        "endDate": "2026-12-07",
                        "projectName": "Amsterdam Tower",
                        "type": "OFFICE_HOURS"
                    }
                }
            }
        ]
    }
]

const userRoleItems = computed(() => {
  const seen = new Set()
  const roleOptions = []

  items.forEach(user => {
    const roleName = user.roles?.[0]?.name
    if (roleName && !seen.has(roleName)) {
      seen.add(roleName)
      roleOptions.push({
        value: roleName,
        label: formatRoleName(roleName)
      })
    }
  })

  return roleOptions
})

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
    // await deleteProject(item.id)

    console.log(item)
  }
  itemsSelected.value = []

  // projectStore.fetchAll()
}

async function handleUpdateUser(user) {
  const draft = getUserDraft(user)

  const payload = {
    id: user.id,
    firstName: draft.firstName,
    lastName: draft.lastName,
    phoneNumber: joinPhoneNumber(draft.phoneCountryCode, draft.phoneLocal),
    roleName: draft.roleName
  }

  console.log('User update payload:', payload)
}
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
  
          <!-- <motion.button
            class="dashboard-header-button"
            type="button"
            :disabled="loading"
            :aria-busy="loading ? 'true' : 'false'"
            :transition="{ duration: 0.2 }"
            :whileHover="{ scale: 1.03 }"
            @click="onCreateProject"
          >
            <SvgIcon name="create-ticket-icon" width="20px" height="20px" />
            <span>{{ t('project.createProjectText') }}</span>
          </motion.button> -->
        </div>
    </div>

    <div class="contract-layout">
      <div id="contract-filter-bar">
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
            <div class="contract-expand-section">
              <span class="contract-expand-header">
                {{ t('user.adjustHeaderText') }}
              </span>

              <div class="contract-expand-grid">
                <!-- First name -->
                <div class="contract-expand-field">
                  <label
                    class="contract-expand-label"
                    :for="`firstName-${user.id}`"
                  >
                    {{ t('user.firstNameLabelText') }}
                  </label>
                  <input
                    :id="`firstName-${user.id}`"
                    v-model="getUserDraft(user).firstName"
                    type="text"
                    class="contract-expand-input"
                  />
                </div>

                <!-- Last name -->
                <div class="contract-expand-field">
                  <label
                    class="contract-expand-label"
                    :for="`lastName-${user.id}`"
                  >
                    {{ t('user.lastNameLabelText') }}
                  </label>
                  <input
                    :id="`lastName-${user.id}`"
                    v-model="getUserDraft(user).lastName"
                    type="text"
                    class="contract-expand-input"
                  />
                </div>

                <!-- Phone number -->
                <div class="contract-expand-field">
                  <label
                    class="contract-expand-label"
                    :for="`phoneNumber-${user.id}`"
                  >
                    {{ t('user.phoneNumberLabelText') }}
                  </label>
                  <!-- <input
                    :id="`phoneNumber-${user.id}`"
                    v-model="getUserDraft(user).phoneNumber"
                    type="tel"
                    class="contract-expand-input"
                  /> -->
                  <ValidatedPhoneInput
                    class="user-expand-phone-input"
                    :id="`phoneNumber-${user.id}`"
                    v-model="getUserDraft(user).phoneLocal"
                    :country-code="getUserDraft(user).phoneCountryCode"
                    :placeholder="t('auth.phone')"
                  />
                </div>

                <!-- Role dropdown -->
                <div class="contract-expand-field">
                  <label
                    class="contract-expand-label"
                    :for="`role-${user.id}`"
                  >
                    {{ t('user.roleLabelText') }}
                  </label>

                  <SearchDropdown
                    :items="userRoleItems"
                    :model-value="getUserDraft(user).roleName"
                    value-key="value"
                    label-key="label"
                    :icon-indent="12"
                    @update:modelValue="value => (getUserDraft(user).roleName = value)"
                  />
                </div>
              </div>

              <div class="contract-expand-actions">
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
.contract-layout {
  flex: 1;
  background-color: var(--color-menu-background);
  margin: 12px;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

#contract-filter-bar {
  display: flex;
  flex-direction: row;
  overflow: visible;
  position: relative;
}
</style>