<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import SvgIcon from '../svg-icon/SvgIcon.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

/**
 * Build breadcrumb chain from current route.
 * WHY: Encapsulate logic so computed remains declarative.
 */
function buildBreadcrumbChain(route, router, t) {
  const chain = []
  let current = route.matched.at(-1)

  while (current) {
    const meta = current.meta || {}
    let label = ''

    if (meta.dynamicTitle) {
      label = meta.dynamicTitle(route)
    } else if (meta.titleKey) {
      label = t(meta.titleKey)
    } else {
      label = current.name
    }

    chain.unshift({ name: current.name, label })

    // WHY: allow custom parent linking even if not direct ancestor
    if (meta.parent) {
      current = router.resolve({ name: meta.parent }).matched.at(-1)
    } else {
      current = null
    }
  }
  return chain
}

const breadcrumbs = computed(() => buildBreadcrumbChain(route, router, t))

const visibleBreadcrumbs = computed(() => {
  const chain = breadcrumbs.value
  return chain.length > 2 ? chain.slice(-2) : chain
})

const mainTitle = computed(() => breadcrumbs.value.at(-1)?.label || '')

const mainTitleParts = computed(() => {
  const title = breadcrumbs.value.at(-1)?.label || ''
  const match = title.match(/^(.*?)(#\S+)(.*)$/) // split into before, hash, after
  if (!match) return { before: title, hash: '', after: '' }
  return { before: match[1].trim(), hash: match[2], after: match[3].trim() }
})
</script>

<template>
  <div class="route-info-container">
    <!-- <div><span class="route-info-title">{{ mainTitle }}</span></div> -->
    <div><span class="route-info-title">
      {{ mainTitleParts.before }}
      <span v-if="mainTitleParts.hash" class="hash-part">{{ mainTitleParts.hash }}</span>
      <span v-if="mainTitleParts.after"> {{ mainTitleParts.after }}</span>
    </span></div>

    <div class="route-info-nav">
      <div class="breadcrumb-chain">
        <template v-for="(crumb, index) in visibleBreadcrumbs" :key="crumb.name">
          <template v-if="index !== visibleBreadcrumbs.length - 1">
            <!-- Only clickable if not the very first crumb -->
            <router-link
              v-if="breadcrumbs.length > 2 || index !== 0"
              :to="{ name: crumb.name }"
              class="breadcrumb-label crumb-link"
            >
              {{ crumb.label }}
            </router-link>
            <span v-else class="breadcrumb-label">{{ crumb.label }}</span>
          </template>
          <span v-else class="breadcrumb-label-current">{{ crumb.label }}</span>

          <SvgIcon
            v-if="index < visibleBreadcrumbs.length - 1"
            class="pointer-icon"
            name="nav-pointer-icon"
            width="10px"
            height="12px"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.route-info-container {
  user-select: none;
  display: flex;
  flex-direction: column;
  color: white;
  max-width: 220px;
  gap: 4px;
}

.route-info-title {
  font-family: 'Noto Sans JP';
  font-size: 32px;
  font-weight: 900;
  line-height: 32px;
}

.route-info-nav {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  gap: 24px;
  line-height: 12px;
}

.breadcrumb-chain {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.breadcrumb-label {
  font-weight: 700;
}

.breadcrumb-label-current {
  font-weight: 400;
}

a.breadcrumb-label {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.hash-part {
  font-family: 'Ubuntu';
  font-weight: 200;
}
</style>