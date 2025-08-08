<script setup>
    import { useRoute, useRouter } from 'vue-router';
    import { computed, nextTick, ref, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { motion } from 'motion-v';

    import { useCurrentUser } from '@/utils/useCurrentUser';
    import { logout } from '@/utils/auth';
    import LogoIconLarge from '@/components/graphic-items/LogoIconLarge.vue';
    import DashboardPageSelectorButton from '@/components/buttons/DashboardPageSelectorButton.vue';
    import SvgIcon from '@/components/svg-icon/SvgIcon.vue';
    import UserInfoTile from '@/components/common/UserInfoTile.vue';

    const { t } = useI18n();
    const { user } = useCurrentUser();
    const router = useRouter();
    const route = useRoute();

    const buttonRefs = ref([]);
    const indicatorY = ref(-15);
    const indicatorHeight = ref(60);
    const wrapperRef = ref(null);
    const menuOpen = ref(false);

    const handleLogout = () => {
      logout();
      router.push('/auth/login');
    };

    const handleBurgerMenuClick = () => {
      menuOpen.value = !menuOpen.value;
    };

    const bar1 = {
      open: { opacity: 0, y: 6 },
      closed: { opacity: 1, y: 0, backgroundColor: 'var(--vt-c-white)' }
    }

    const bar2 = {
      open: { rotate: 45, y: 0, backgroundColor: 'var(--color-text)' },
      closed: { rotate: 0, y: 0, backgroundColor: 'var(--vt-c-white)' }
    }

    const bar3 = {
      open: { rotate: -45, y: -7.5, backgroundColor: 'var(--color-text)' },
      closed: { rotate: 0, y: 0, backgroundColor: 'var(--vt-c-white)' }
    }

    const pages = [
      {label: t('dash.navOverviewText'), icon: 'overview-icon', to: '/dashboard/overview'},
      {label: t('dash.navTicketsText'), icon: 'tickets-icon', to: '/dashboard/tickets'},
      {label: t('dash.navProjectsText'), icon: 'projects-icon', to: '/dashboard/projects'},
      {label: t('dash.navContractsText'), icon: 'contracts-icon', to: '/dashboard/contracts'},
      {label: t('dash.navUsersText'), icon: 'users-icon', to: '/dashboard/users'},
      {label: t('dash.navSettingsText'), icon: 'settings-icon', to: '/dashboard/settings'}
    ];

    const userMenuOptions = [
      {label: t('dash.logoutText'), action: handleLogout}
    ];

    const selectedPages = computed(() => 
      pages.map(page => ({
        ...page,
        selected: route.path.startsWith(page.to)
      }))
    );

    watch(() => route.path, () => {
      nextTick(() => {
        const selectedIndex = selectedPages.value.findIndex(p => p.selected);
        const el = buttonRefs.value[selectedIndex];

        if(!el) return;

        const wrapperTop = wrapperRef.value.getBoundingClientRect().top;
        const rect = el.getBoundingClientRect();
        const newY = rect.top + rect.height / 2 - wrapperTop - 30;
        
        indicatorHeight.value = 70;
        indicatorY.value = newY;

        setTimeout(() => {
          indicatorHeight.value = 60;
        }, 150);
      });
    }, { immediate: true });
</script>

<template>
  <div class="dashboard-page">
    <SvgIcon name="gradient-background-banner" height="184px" class="page-background"/>

    <motion.div 
      id="menu-toggle-button" 
      @click="handleBurgerMenuClick"
      :initial="false"
      :animate="menuOpen ? 'open' : 'closed'"
    >
      <motion.span class="bar" :variants="bar1"/>
      <motion.span id="bar2" class="bar" :variants="bar2"/>
      <motion.span class="bar" :variants="bar3"/>
    </motion.div>

    <div class="dashboard-index-background">
      <div id="dashboard-branding">
        <LogoIconLarge />
        <span style="font-weight: 700; font-size: 50px; font-family: 'Noto Sans JP'; user-select: none;">Helvar</span>
      </div>

      <div class="selection-menu-wrapper" ref="wrapperRef">
        <motion.div
          class="selection-menu-indicator"
          :animate="{ y: indicatorY, height: indicatorHeight + 'px' }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
        >
          <SvgIcon name="selection-indicator"/>
        </motion.div>

        <div id="dashboard-selection-menu">
          <DashboardPageSelectorButton
            v-for="( page, index ) in selectedPages"
            :key="page.to"
            :label="page.label"
            :icon="page.icon"
            :to="page.to"
            :selected="page.selected"
            :ref="el => buttonRefs[index] = el?.$el"
          />
        </div>
      </div>

      <UserInfoTile 
        :first-name="user.value?.firstName ?? ''" 
        :last-name="user.value?.lastName ?? ''" 
        :email="user.value?.email ?? ''" 
        :menu-options="userMenuOptions"
      />
    </div>

    <router-view id="dashboard-views" v-slot="{ Component }">
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

    #dashboard-views {
      z-index: 1;
    }

    .dashboard-index-background {
        background-color: var(--color-menu-background);
        min-width: 250px;
        width: 20%;
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

    .selection-menu-wrapper {
      position: relative;
    }

    .selection-menu-indicator {
      position: absolute;
      top: 0;
      left: 0;
      width: 8px;
      height: 60px;
    }

    .page-background {
      position: absolute;
    }

    #menu-toggle-button {
      width: 24px;
      height: 18px;
      position: absolute;
      top: 20px;
      right: 20px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 100;
    }

    #menu-toggle-button .bar {
      height: 3px;
      width: 100%;
      border-radius: 3px;
    }
</style>