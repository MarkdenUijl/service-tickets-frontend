<script setup>
    import { useI18n } from 'vue-i18n';
    import { watchEffect } from 'vue';
    import SvgIcon from '../svg-icon/SvgIcon.vue';
    
    const { locale } = useI18n();
    
    const setLanguage = (newLang) => {
        locale.value = newLang;
        localStorage.setItem('lang', newLang);
    };
    
    watchEffect(() => {
        const storedLang = localStorage.getItem('lang');
        
        if (storedLang) {
            locale.value = storedLang;
        }
    });

    const isCurrentLang = (lang) => locale.value === lang;
</script>

<template>
    <div class="language-switcher">
        <button :style="{ opacity: isCurrentLang('nl') ? 1 : 0.2  }" 
                @click="setLanguage('nl')" >
            <SvgIcon class="flag" name="Flag-NL" width="40px" height="28px" radius="4px"/>
        </button>

        <button :style="{ opacity: isCurrentLang('en') ? 1 : 0.2  }"  
                @click="setLanguage('en')" >
            <SvgIcon class="flag" name="Flag-UK" width="40px" height="28px" radius="4px"/>
        </button>
    </div>
</template>
  
<style>
    .language-switcher {
        display: flex;
        flex-direction: row;
        gap: 8px;
    }

    .language-switcher button {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s ease;
    }

    .language-switcher .flag {
        box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.25);
    }
</style>