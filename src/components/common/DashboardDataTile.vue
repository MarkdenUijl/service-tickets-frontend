<script setup>
    import { GridItem } from 'grid-layout-plus';
    import { motion, AnimatePresence } from 'motion-v';
    import { reactive, ref, computed } from 'vue';
    import { useI18n } from 'vue-i18n';

    import { useWindowSize } from '@/composables/useWindowSize';

    const { t } = useI18n();
    const { windowWidth } = useWindowSize();

    const props = defineProps({
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        w: { type: Number, required: true },
        h: { type: Number, required: true },
        i: { type: String, required: true },
    });

    const emit = defineEmits(['resizeRequest', 'deletionRequest']);

    const setSize = (size) => {
        let newWidth, newHeight;

        switch( size ) {
            case 'small':
                newWidth = 1;
                newHeight = 1;
                break;

            case 'medium-wide':
                newWidth = 2;
                newHeight = 1;
                break;

            case 'medium-tall':
                newWidth = 1;
                newHeight = 2;
                break;
            
            case 'large':
                newWidth = 2;
                newHeight = 2;
                break;

            default:
                newWidth = 1;
                newHeight = 1;
                break;
        }

        emit('resizeRequest', { id: props.i, w: newWidth, h: newHeight });
    };

    const deleteTile = () => {
        emit('deletionRequest', props.i);
    };

    const menuOpen = ref(false);

    const handleTileMenuClick = () => {
        menuOpen.value = !menuOpen.value;
    };

    const dotMid = {
        open: { 
            width: 24, 
            height: 3,
            transition: { 
                type: 'spring',
                stiffness: 600,
                damping: 32,
            }
        },
        closed: { 
            width: 6, 
            height: 6,
            transition: { 
                type: 'spring',
                stiffness: 300,
                damping: 16,
                bounce: 0.1
            }
        }
    };

    const topPath = {
        closed: { d: "M12 3 L12 3",
                transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 16,
                    bounce: 0.1
                }
         },
        open: {
            d: "M0 12 6 7",
            transition: {
                type: 'spring',
                stiffness: 600,
                damping: 32,
            }
        }
    }

    const botPath = {
        closed: { d: "M12 9 L12 9",
                transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 16,
                    bounce: 0.1
                }
         },
        open: {
            d: "M0 0 6 5",
            transition: {
                type: 'spring',
                stiffness: 600,
                damping: 32,
            }
        }
    }

    const tileMenuOptions = reactive([
        { 
            title: t('dash.tileMenuTitleSizeText'),
            isOpen: false,
            hideOnMobile: true,
            menuItems: [
                {
                    optionTitle: t('dash.tileMenuSmallSizeText'),
                    clickAction: () => setSize('small')
                },{
                    optionTitle: t('dash.tileMenuMediumWideSizeText'),
                    clickAction: () => setSize('medium-wide')
                },{
                    optionTitle: t('dash.tileMenuMediumTallSizeText'),
                    clickAction: () => setSize('medium-tall')
                },{
                    optionTitle: t('dash.tileMenuLargeSizeText'),
                    clickAction: () => setSize('large')
                }
            ]
        },{ 
            title: t('dash.tileDataDisplayText'),
            isOpen: false,
            hideOnMobile: false,
            menuItems: [
                {
                    optionTitle: t('dash.tileMenuSmallSizeText'),
                    clickAction: () => setSize('small')
                },{
                    optionTitle: t('dash.tileMenuMediumWideSizeText'),
                    clickAction: () => setSize('medium-wide')
                },{
                    optionTitle: t('dash.tileMenuMediumTallSizeText'),
                    clickAction: () => setSize('medium-tall')
                },{
                    optionTitle: t('dash.tileMenuLargeSizeText'),
                    clickAction: () => setSize('large')
                }
            ]
        }
    ]);

    const visibleTileMenuOptions = computed(() => {
        return tileMenuOptions.filter(option =>
            !(windowWidth.value <= 635 && option.hideOnMobile)
        );
    });

    const toggleOptionMenu = (option) => {
        option.isOpen = !option.isOpen;
    };
</script>

<template>
    <GridItem
        :key="i"
        :x="x"
        :y="y"
        :w="w"
        :h="h"
        :i="i"
        class="dashboard-tile"
    >
        <motion.div 
            class="tile-menu-button"
            @click="handleTileMenuClick"
            :initial="false"
            :animate="menuOpen ? 'open' : 'closed'"
        >
            <svg class="svg-dot" width="24" height="12" viewBox="0 0 24 12">
                <motion.path
                    stroke="var(--color-text)"
                    :stroke-width="menuOpen ? 3 : 6"
                    fill="transparent"
                    stroke-linecap="round"
                    :variants="topPath"
                />
            </svg>
            
            <motion.span class="dot" :variants="dotMid"/>
            
            <svg class="svg-dot" width="24" height="12" viewBox="0 0 24 12">
                <motion.path
                    stroke="var(--color-text)"
                    :stroke-width="menuOpen ? 3 : 6"
                    fill="transparent"
                    stroke-linecap="round"
                    :variants="botPath"
                />
            </svg>
        </motion.div>
        
        <AnimatePresence>
            <motion.div 
                class="tile-menu"
                v-if="menuOpen"
                :initial="{ opacity: 0, x: '100%' }"
                :animate="{ opacity: 1, x: 0 }"
                :exit="{ opacity: 0, x: '100%' }"
                :transition="{ 
                    type: 'spring',
                    stiffness: 600,
                    damping: 32
                }"
            >
                <div 
                    v-for="option in visibleTileMenuOptions"
                    @click="toggleOptionMenu(option)"
                    class="tile-menu-option"
                >
                    <div 
                        class="menu-option-title"
                        :class="{ 'open': option.isOpen }"
                    >
                        {{ option.title }}
                    </div>

                    <AnimatePresence>
                        <motion.div 
                            v-if="option.isOpen" 
                            class="tile-option-submenu"
                            :initial="{ opacity: 0.3, maxHeight: 0 }"
                            :animate="{ opacity: 1, maxHeight: 200 }"
                            :exit="{ opacity: 0.3, maxHeight: 0 }"
                            :transition="{ 
                                type: 'spring',
                                stiffness: 100,
                                damping: 16,
                                bounce: 0.1
                            }"
                        >
                            <div class="submenu-inner">
                                <div 
                                    v-for="item in option.menuItems"
                                    @click.stop="item.clickAction"
                                    class="tile-submenu-option"
                                >
                                    {{ item.optionTitle }}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div 
                    @click="deleteTile()"
                    class="tile-menu-option"
                >
                    <div 
                        class="menu-option-title"
                    >
                        {{ t('dash.tileDeleteText') }}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
        
        <div class="tile-header">
            TILE HEADER
        </div>
        <div class="tile-size-info">
            <span>W: {{ props.w }}</span>
            <span>H: {{ props.h }}</span>
        </div>
        <slot />
    </GridItem>
</template>

<style>
    .dashboard-tile {
        background-color: var(--color-menu-background);
        padding: 20px 16px;
        border-radius: 12px;
        position: relative;
        transition: all 300ms cubic-bezier(0.25, 1.25, 0.5, 1);
        overflow: hidden;
        user-select: none;
    }

    .tile-header {
        font-family: 'Noto Sans JP';
        font-size: 16px;
        font-weight: 700;
    }

    .tile-header button {
        cursor: pointer;
        padding: 4px 8px;
    }

    .tile-menu-button {
        position: absolute;
        width: 32px;
        height: 32px;
        padding: 3px;
        top: 20px;
        right: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        border-radius: 4px;
        z-index: 10;
    }

    .tile-menu-button .dot {
        height: 6px;
        width: 6px;
        border-radius: 6px;
        background-color: var(--color-text);
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }

    .svg-dot {
        background: none;
        overflow: visible;
        pointer-events: none;
    }

    .tile-menu {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 12px;
        z-index: 2;
        padding: 20px 0;
        overflow: scroll;
    }

    .tile-menu::-webkit-scrollbar {
        display: none;
    }

    .tile-menu::before {
        content: "";
        position: absolute;
        inset: 0;
        background-color: var(--color-menu-background);
        opacity: 0.9;
        z-index: -1;
    }

    .tile-menu-option {
        padding-left: 16px;
        cursor: pointer;
        max-width: 75%;
    }

    .menu-option-title {
        font-weight: 500;
        padding: 8px;
        border-radius: 8px;
    }

    .menu-option-title.open {
        background-color: var(--color-highlight);
        color: var(--vt-c-white);
    }

    .tile-option-submenu {
        overflow: hidden;
    }

    .submenu-inner {
        margin: 8px;
    }

    .tile-submenu-option {
        cursor: pointer;
        padding: 4px 16px;
        border-left: 2px var(--color-text) solid;
    }

    .tile-submenu-option:hover {
        border-left: 4px var(--color-highlight) solid;
    }
</style>