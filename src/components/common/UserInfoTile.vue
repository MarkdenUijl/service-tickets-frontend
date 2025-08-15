<script setup>
    import { motion, AnimatePresence } from 'motion-v';
    import { onMounted, onUnmounted, computed, ref } from 'vue';

    const props = defineProps({
        firstName: {type: String, default: ''},
        lastName: {type: String, default: ''},
        email: {type: String, default: ''},
        textColor: {type: String, default: 'var(--color-text)'},
        menuOptions: {
            type: Array,
            default: () => null
        }
    });

    const userInfo = computed(() => {
        const fullName = `${props.firstName} ${props.lastName}`.trim();
        const initials = `${props.firstName[0] ?? '-'}${props.lastName[0] ?? '-'}`.toUpperCase();

        return {
            fullName,
            email: props.email,
            initials
        }
    });

    const hoverAnimation = computed(() => 
        hasMenu.value
            ? { scale: 1.1, boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.3)' }
            : undefined
    )

    const handleClickOutside = (e) => {
        if (!tileRef.value) return;

        const clickedOutside = !tileRef.value.contains(e.target);

        if (clickedOutside && showMenu.value) {
            showMenu.value = false;
        }
    };

    onMounted(() => {
        window.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
        window.removeEventListener('click', handleClickOutside)
    });

    const tileRef = ref(null);
    const showMenu = ref(false);
    const hasMenu = computed(() => Array.isArray(props.menuOptions) && props.menuOptions.length > 0);

    const toggleMenu = () => {
        if (hasMenu.value) showMenu.value = !showMenu.value;
    }
</script>

<template>
    <div id="user-info-tile" ref="tileRef">
        <motion.div 
          id="user-info-picture-frame" 
          @click="toggleMenu"
          :class="{ clickable: hasMenu }"
          :while-hover="hoverAnimation"
          :style="{ cursor: hasMenu ? 'pointer' : 'default' }"
        >
          {{ userInfo.initials }}
        </motion.div>

        <AnimatePresence>
          <motion.div 
            v-if="hasMenu && showMenu" 
            class="user-info-menu"
            @click.stop
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: 10 }"
            :transition="{ duration: 0.3, ease: 'easeOut' }"
          >
            <div
              class="user-info-menu-item"
              v-for="option in props.menuOptions"
              :key="option.label"
              @click="option.action"
            >
              {{ option.label }}
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div id="user-info-contact">
          <span :style="{ color: textColor }" style="font-family: 'Noto Sans JP'; font-size: 16px; font-weight: 800;">{{ userInfo.fullName }}</span>
          <span :style="{ color: textColor }" style="font-size: 13px; font-weight: 300;">{{ userInfo.email }}</span>
        </div>
      </div>
</template>

<style scoped>
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

    @media (max-width: 635px) {
      #user-info-tile {
        position: absolute;
        top: 10px;
        left: 10px;
        bottom: auto;
        transform: none;
        border-top: none;
        z-index: 9;
      }

      .user-info-menu {
        left: 24px;
        bottom: -48px;
      }
    }
</style>