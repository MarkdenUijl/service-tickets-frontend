<script setup>
    import { useRoute, useRouter } from 'vue-router';
    import { computed, nextTick, ref, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { AnimatePresence, motion } from 'motion-v';

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

    const isMobile = ref(window.innerWidth <= 635);

    window.addEventListener('resize', () => {
      isMobile.value = window.innerWidth <= 635;
    })

    const showMenu = computed(() => !isMobile.value || menuOpen.value);

    const handleLogout = () => {
      logout();
      router.push('/auth/login');
    };

    const handleBurgerMenuClick = () => {
      menuOpen.value = !menuOpen.value;
    };

    const barTop = { open: { opacity: 0, y: 6 }, closed: { opacity: 1, y: 0, backgroundColor: 'var(--vt-c-white)' } }
    const barMid = { open: { rotate: 45, y: 0, backgroundColor: 'var(--color-text)' }, closed: { rotate: 0, y: 0, backgroundColor: 'var(--vt-c-white)' } }
    const barBot = { open: { rotate: -45, y: -7.5, backgroundColor: 'var(--color-text)' }, closed: { rotate: 0, y: 0, backgroundColor: 'var(--vt-c-white)' } }

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

    const updateIndicator = () => {
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
    };

    watch(() => route.path, () => {
      nextTick(() => {
        updateIndicator();

        if ( menuOpen.value ) menuOpen.value = false;
      });
    }, { immediate: true });

    watch(showMenu, (visible) => {
      if (visible) {
        nextTick( () => updateIndicator() );
      }
    });
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
      <motion.span class="bar" :variants="barTop"/>
      <motion.span class="bar" :variants="barMid"/>
      <motion.span class="bar" :variants="barBot"/>
    </motion.div>

    <UserInfoTile
      v-if="isMobile"
      :first-name="user.firstName ?? ''" 
      :last-name="user.lastName ?? ''" 
      :email="user.email ?? ''"
      :text-color="'var(--vt-c-white)'"
    />

    <AnimatePresence>
      <motion.div
        v-if="showMenu"
        class="dashboard-index-background"
        :class="{'menu-open': menuOpen}"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.15 }"
      >
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

            <DashboardPageSelectorButton
              v-if="isMobile"
              key="LogoutButton"
              :label="t('dash.logoutText')"
              icon="logout-icon"
              to="/"
              :selected="false"
              ref="99"
              @click="handleLogout"
            />
          </div>
        </div>

        <UserInfoTile
          v-if="!isMobile"
          :first-name="user.firstName ?? ''" 
          :last-name="user.lastName ?? ''" 
          :email="user.email ?? ''" 
          :menu-options="userMenuOptions"
        />
      </motion.div>
    </AnimatePresence>

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
      padding: 24px;
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
      display: none;
      width: 24px;
      height: 18px;
      position: absolute;
      top: 32px;
      right: 20px;
      cursor: pointer;
      flex-direction: column;
      justify-content: space-between;
      z-index: 100;
    }

    #menu-toggle-button .bar {
      height: 3px;
      width: 100%;
      border-radius: 3px;
    }

    @media (max-width: 635px) {
      #menu-toggle-button {
        display: flex;
      }

      .dashboard-index-background.menu-open{
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100dvh;
        z-index: 99;
        overflow-y: auto;
      }

      #dashboard-views {
        padding-top: 80px;
      }
    }
</style>