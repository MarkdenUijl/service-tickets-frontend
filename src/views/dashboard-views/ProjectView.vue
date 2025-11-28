<script setup>
import RouteInfo from '@/components/common/RouteInfo.vue'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'
import { ref } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import SearchInput from '@/components/user-input/SearchInput.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchInput = ref('')
const loading = ref(false)


</script>

<template>
    <div class="dashboard-view-wrapper">
        <div class="dashboard-header-items">
          <RouteInfo />

          <div class="dashboard-button-container">
            <p>BUTTON PLACEHOLDER</p>
          </div>
        </div>

        <div class="project-layout">
          <div id="project-filter-bar">
            <button
              id="project-filter-button"
              type="button"
              :disabled="loading"
              :aria-busy="loading ? 'true' : 'false'"
              @click.stop="handleFilterClick"
            >
              <SvgIcon name="filter-icon" height="20px" width="20px" />
              <span>{{ t('ticket.filterButtonText') }}</span>
            </button>

            <SearchInput :placeholder="t('ticket.searchTicketText')" variant="inline" v-model="searchInput" />

            <!-- <AnimatePresence>
              <motion.div
                class="filter-popout"
                v-if="isFilterOpen"
                v-click-outside="onClickOutside"
                role="region"
                :initial="{ opacity: 0, y: -16 }"
                :animate="{ opacity: 1, y: 0 }"
                :exit="{ opacity: 0, y: -16 }"
                :transition="{ type: 'spring', stiffness: 300, damping: 24 }"
              >
                <div
                  v-for="section in filterSections"
                  :key="section.id"
                  class="filter-section"
                >
                  <div 
                    class="filter-section-header" 
                    :class="{ open: section.isOpen }"
                    @click="toggleFilterSection(section)"
                  >
                    {{ t(`ticket.column${capitalizeWords(section.title)}Text`) }}
                  </div>

                  <AnimatePresence>
                    <motion.div
                      v-if="section.isOpen"
                      class="filter-section-content"
                      :id="`filter-section-${section.id}-content`"
                      :initial="{ opacity: 0.3, maxHeight: 0 }"
                      :animate="{ opacity: 1, maxHeight: 300 }"
                      :exit="{ opacity: 0.3, maxHeight: 0 }"
                      :transition="{ type: 'spring', stiffness: 100, damping: 16, bounce: 0.1 }"
                      style="overflow: hidden;"
                    >
                      <label
                        v-for="option in section.options"
                        :key="option"
                        class="filter-checkbox-label"
                      >
                        <input type="checkbox" :value="option" v-model="section.model" />
                        {{ t(`ticket.${section.title.toLowerCase()}${capitalizeWords(option)}Text`) }}
                      </label>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence> -->
          </div>
        </div>
    </div>
</template>

<style>
.project-layout {
  flex: 1;
  background-color: var(--color-menu-background);
  margin: 12px;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

#project-filter-bar {
  display: flex;
  flex-direction: row;
  overflow: visible;
  position: relative;
}

#project-filter-button {
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

#project-filter-button[disabled] {
  opacity: 0.6;
  cursor: default;
}

#project-filter-button span {
  font-size: 13px;
  font-weight: 700;
}
</style>