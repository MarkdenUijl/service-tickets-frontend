<script setup> 
    import { computed, ref } from 'vue';
    import { motion, AnimatePresence } from 'motion-v';
    import { useI18n } from 'vue-i18n';
    import SvgIcon from '../svg-icon/SvgIcon.vue';

    const props = defineProps({ modelValue: String });
    const emit = defineEmits([ 'update:modelValue' ]);

    const { t } = useI18n();
    const isFocused = ref(false);

    const input = computed({
        get: () => props.modelValue,
        set: (val) => emit( 'update:modelValue', val )
    });

    // temporary search bar filling
    const fruits = ['apple', 'pear', 'banana', 'orange', 'lemon', 'lime', 'potato', 'mandarin', 'tomato'];

    const filteredList = () => {
        return fruits.filter((fruit) => 
            fruit.toLowerCase().includes(input.value.toLowerCase())
        );
    };

    const menuOpen = computed(() => input.value && isFocused.value);
</script>

<template>
    <div 
        class="search-bar-container" 
        v-click-outside="() => isFocused = false"
    >
        <input 
            class="search-bar" 
            name="search-bar" 
            type="text" 
            v-model="input" 
            :placeholder="t('dash.searchProjectsText')"
            @focus="isFocused = true"
            @blur="isFocused = false"
        />
        
        <SvgIcon 
            v-if="!input"
            class="search-icon"
            name="search-icon" 
            width="24px" 
            height="24px"
        />

        <AnimatePresence>
            <motion.div 
                class="search-results" 
                v-if="menuOpen"
                layout
                :initial="{ opacity: 0, height: 0, transformOrigin: 'top' }"
                :animate="{ opacity: 1, height: 'auto', transformOrigin: 'top' }"
                :exit="{ opacity: 0, height: 0, transformOrigin: 'top' }"
                :transition="{
                    type: 'spring',
                    stiffness: 200,
                    damping: 26
                }"
            >
                <motion.div 
                    class="search-item" 
                    v-for="listItem in filteredList()" 
                    :key="listItem"
                    layout
                    :while-hover="{ 
                        backgroundColor: 'var(--color-shadow)',
                        paddingLeft: '24px' 
                    }"
                    @click="input = listItem"
                >
                    <p>{{ listItem }}</p>
                </motion.div>
            
                <div class="search-item no-results" v-if="!filteredList().length">
                    <p>{{ t('dash.noResultsFoundText') }}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
</template>

<style scoped>
    .search-bar-container {
        width: 100%;
        position: relative;
    }

    .search-bar {
        font-family: 'Ubuntu', sans-serif;
        background-color: var(--color-menu-background);
        border: none;
        color: var(--color-text);
        width: 100%;
        border-radius: 4px;
        padding: 0 48px;
        height: 40px;
        font-size: 16px;
        box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
        outline: none;
    }

    .search-icon {
        position: absolute;
        top: 50%;
        translate: 0 -50%;
        left: 16px;
        color: var(--color-subtext);
    }

    .search-bar::placeholder {
        color: var(--color-subtext);
    }

    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: var(--color-menu-background);
        border-radius: 4px;
        box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.25);
        margin-top: 4px;
        z-index: 100;
        overflow: scroll;
        max-height: 200px;
    }

    .search-results::-webkit-scrollbar {
        display: none;
    }

    .search-item {
        padding: 12px 16px;
        cursor: pointer;
        color: var(--color-text);
    }

    .no-results {
        color: var(--color-subtext);
        font-style: italic;
    }
</style>