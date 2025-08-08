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

    <div id="menu-toggle-button" :class="menuOpen ? 'open' : ''" @click="handleBurgerMenuClick">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>

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
      z-index: 10;
      position: absolute;
      top: 20px;
      right: 20px;
      width: 24px;
      height: 18px;
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
      -webkit-transition: .5s ease-in-out;
      -moz-transition: .5s ease-in-out;
      -o-transition: .5s ease-in-out;
      transition: .5s ease-in-out;
      cursor: pointer;
    }

    #menu-toggle-button span {
      display: block;
      position: absolute;
      height: 3px;
      width: 100%;
      background: var(--vt-c-white);
      border-radius: 3px;
      opacity: 1;
      left: 0;
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
      -webkit-transition: .25s ease-in-out;
      -moz-transition: .25s ease-in-out;
      -o-transition: .25s ease-in-out;
      transition: .25s ease-in-out;
    }

    #menu-toggle-button span:nth-child(1) {
      top: 0px;
    }

    #menu-toggle-button span:nth-child(2),#menu-toggle-button span:nth-child(3) {
      top: 9px;
    }

    #menu-toggle-button span:nth-child(4) {
      top: 18px;
    }

    #menu-toggle-button.open span:nth-child(1) {
      top: 9px;
      width: 0%;
      left: 50%;
    }

    #menu-toggle-button.open span:nth-child(2) {
      -webkit-transform: rotate(45deg);
      -moz-transform: rotate(45deg);
      -o-transform: rotate(45deg);
      transform: rotate(45deg);
      background: var(--vt-c-black);
    }

    #menu-toggle-button.open span:nth-child(3) {
      -webkit-transform: rotate(-45deg);
      -moz-transform: rotate(-45deg);
      -o-transform: rotate(-45deg);
      transform: rotate(-45deg);
      background: var(--vt-c-black);
    }

    #menu-toggle-button.open span:nth-child(4) {
      top: 9px;
      width: 0%;
      left: 50%;
    }
</style>