<script setup>
    import { useRoute } from 'vue-router';
    import { computed } from 'vue';
    import LogoIconLarge from '@/components/graphic-items/LogoIconLarge.vue';
    import DashboardPageSelectorButton from '@/components/buttons/DashboardPageSelectorButton.vue';

    import { useI18n } from 'vue-i18n';
    const { t } = useI18n();

    const pages = [
      {label: t('dash.navOverviewText'), icon: 'overview-icon', to: '/dashboard/overview'},
      {label: t('dash.navTicketsText'), icon: 'tickets-icon', to: '/dashboard/tickets'},
      {label: t('dash.navProjectsText'), icon: 'projects-icon', to: '/dashboard/projects'},
      {label: t('dash.navContractsText'), icon: 'contracts-icon', to: '/dashboard/contracts'},
      {label: t('dash.navUsersText'), icon: 'users-icon', to: '/dashboard/users'},
      {label: t('dash.navSettingsText'), icon: 'settings-icon', to: '/dashboard/settings'}
    ];

    const selectedPages = computed(() => 
      pages.map(page => ({
        ...page,
        selected: route.path.startsWith(page.to)
      }))
    )

    const route = useRoute();

</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-index-background">
      <div id="dashboard-branding">
        <LogoIconLarge />
        <span style="font-weight: 700; font-size: 50px; font-family: 'Noto Sans JP'; user-select: none;">Helvar</span>
      </div>

      <div id="dashboard-selection-menu">
        <DashboardPageSelectorButton
          v-for="page in selectedPages"
          :key="page.to"
          :label="page.label"
          :icon="page.icon"
          :to="page.to"
          :selected="page.selected"
        />
      </div>
    </div>

    <router-view v-slot="{ Component }">
      <component :is="Component"/>
    </router-view>
  </div>
</template>

<style scoped>
    .dashboard-page {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: stretch;
        min-height: 100dvh;
        width: 100%;
        box-sizing: border-box;
    }

    .dashboard-index-background {
        background-color: var(--color-menu-background);
        min-width: 400px;
        height: 100dvh;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 84px;
        z-index: 1;
        border-radius: 0;
        position: relative;
    }

    #dashboard-branding {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      gap: 8px;
      height: 72px;
      margin-top: 40px;
      align-self: center;
    }

    #dashboard-selection-menu {
      display: flex;
      flex-direction: column;
      gap: 32px;
      width: 100%;
    }

</style>