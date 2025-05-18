<script setup>
    import { useRoute } from 'vue-router';
    import { computed, ref } from 'vue';
    import { motion } from 'motion-v';

    import UISelector from '@/components/ui-selector/UISelector.vue';
    import SvgIcon from '@/components/svg-icon/SvgIcon.vue';
    import LogoLarge from '@/components/graphic-items/LogoLarge.vue';

    const route = useRoute();

    const backgroundWidth = computed(() => {
        return route.name === 'register' ? '50%' : '40%';
    });

    const formProgress = ref(0);
    
    function handleFormProgress(value) {
        formProgress.value = value;
    }
</script>

<template>
  <div class="auth-page">
    <LogoLarge id="homescreen-logo" />

    <SvgIcon class="background" name="gradient-background" />

    <motion.div 
      class="auth-background"
      :animate="{ width: backgroundWidth }"
      :transition="{
        type: 'spring',
        visualDuration: 0.6,
        bounce: 0.3,
      }"
    >
      <UISelector id="ui-selector" />

      <router-view @form-progress="handleFormProgress"/>

      <div id="register-progress-bar">
        <div id="register-progress-fill" :style="{ width: formProgress + '%' }" />
      </div>
    </motion.div>
  </div>
</template>

<style scoped>
    .auth-page {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: stretch;
        min-height: 100vh;
        width: 100%;
        box-sizing: border-box;
    }

    .auth-background {
        background-color: var(--color-background);
        min-width: 400px;
        height: 100vh;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: -4px 4px 4px 0px rgba(0, 0, 0, 0.10);
        z-index: 1;
        border-radius: 0;
        position: relative;
    }

    .background {
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        z-index: 0;
        pointer-events: none;
    }

    #homescreen-logo {
        position: absolute;
        left: 16px;
        top: 16px;
        width: 48px;
        height: auto;
        z-index: 1;
        box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.25);
        transition: all 0.3s ease;
    }

    #ui-selector {
        position: absolute;
        top: 16px;
        right: 16px;
    }
    
    #register-progress-bar {
        height: 8px;
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        overflow: hidden;
        display: flex;
        align-items: flex-start;
    }

        #register-progress-fill {
        height: 100%;
        background-color: var(--vt-c-green);
        transition: width 0.3s ease-in-out;
    }

    @media (max-width: 635px) {
        .auth-page {
            flex-direction: column;
            justify-content: center;
        }

        .auth-background {
            width: 100% !important;
            height: 90%;
            max-width: 100%;
            border-radius: 24px 24px 0 0;
            padding: 16px;
        }

        #homescreen-logo {
            display: none;
        }
    }
</style>