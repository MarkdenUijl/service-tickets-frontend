<script setup>
    import { useRoute, useRouter } from 'vue-router';
    import { computed, nextTick, ref, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { motion, AnimatePresence } from 'motion-v';

    import { useCurrentUser } from '@/utils/useCurrentUser';
    import { logout } from '@/utils/auth';
    import LogoIconLarge from '@/components/graphic-items/LogoIconLarge.vue';
    import DashboardPageSelectorButton from '@/components/buttons/DashboardPageSelectorButton.vue';
    import SvgIcon from '@/components/svg-icon/SvgIcon.vue';
    
    
    const { t } = useI18n();
    const { user } = useCurrentUser();
    const router = useRouter();
    const route = useRoute();

    const showMenu = ref(false);
    const buttonRefs = ref([]);
    const indicatorY = ref(-15);
    const indicatorHeight = ref(60);
    const wrapperRef = ref(null);

    const handleLogout = () => {
      logout();
      router.push('/auth/login');
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

    const userInfo = computed(() => {
      const userVal = user.value;
      if (!userVal) {
        return {
          fullName: '',
          email: '',
          initials: '--'
        };
      }

      const firstName = userVal.firstName ?? '';
      const lastName = userVal.lastName ?? '';
      const fullName = `${firstName} ${lastName}`.trim();
      const email = userVal.email ?? '';
      const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

      return { fullName, email, initials };
    });

    const toggleMenu = () => {
      showMenu.value = !showMenu.value;
    };

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

      <div id="user-info-tile">
        <motion.div 
          id="user-info-picture-frame" 
          @click="toggleMenu"
          :while-hover="{ scale: 1.1, boxShadow: '0px 0px 8px rgba(255, 255, 255, 0.3)' }"
        >
          {{ userInfo.initials }}
        </motion.div>

        <AnimatePresence>
          <motion.div 
            v-if="showMenu" 
            class="user-info-menu"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: 10 }"
            :transition="{ duration: 0.3, ease: 'easeOut' }"
          >
            <div
              class="user-info-menu-item"
              v-for="option in userMenuOptions"
              :key="option.label"
              @click="option.action"
            >
              {{ option.label }}
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div id="user-info-contact">
          <span style="font-family: 'Noto Sans JP'; font-size: 16px; font-weight: 800;">{{ userInfo.fullName }}</span>
          <span style="font-size: 13px; font-weight: 300;">{{ userInfo.email }}</span>
        </div>
      </div>
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
        /* min-width: 400px; */
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

    #user-info-tile {
      border-top: 1px solid var(--color-subtext);
      width: 90%;
      max-width: 320px;
      padding: 10px;
      align-self: center;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
    }

    #user-info-picture-frame {
      height: 40px;
      width: 40px;
      background-color: var(--vt-c-red);
      border-radius: 20px;
      box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.25);
      font-family: 'Noto Sans JP';
      font-size: 16px;
      font-weight: 900;
      color: var(--vt-c-white);
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      cursor: pointer;
    }

    #user-info-contact {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .user-info-menu {
      position: absolute;
      left: 0;
      bottom: 56px;
      background: var(--color-menu-background);
      border: 1px solid var(--color-subtext);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 8px 0px;
      display: flex;
      flex-direction: column;
      width: 100%;
      z-index: 10;
    }

    .user-info-menu-item {
      padding: 6px 16px;
      font-size: 14px;
      font-weight: 400;
      cursor: pointer;
      user-select: none;
    }

    .user-info-menu-item:hover {
      background-color: var(--color-background);
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
</style>