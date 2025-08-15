<script setup>
    import { GridItem } from 'grid-layout-plus';
    import { motion } from 'motion-v';
    import { ref } from 'vue';

    const props = defineProps({
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        w: { type: Number, required: true },
        h: { type: Number, required: true },
        i: { type: String, required: true }
    });

    const emit = defineEmits(['resizeRequest']);

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
                damping: 28,
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
                stiffness: 500,
                damping: 24,
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
                stiffness: 500,
                damping: 24,
            }
        }
    }

    
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

        <div class="tile-header">
            <button @click="setSize('small')">S</button>
            <button @click="setSize('medium-wide')">MW</button>
            <button @click="setSize('medium-tall')">MT</button>
            <button @click="setSize('large')">L</button>
        </div>  
        <slot />
    </GridItem>
</template>

<style>
    .dashboard-tile {
        background-color: var(--color-menu-background);
        padding: 16px;
        border-radius: 12px;
        position: relative;
        transition: all 300ms cubic-bezier(0.25, 1.25, 0.5, 1);
    }

    .tile-header {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
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
    }

    .tile-menu-button:hover {
        box-shadow: 0 0 12px var(--color-shadow);
    }

    .tile-menu-button .dot {
        height: 6px;
        width: 6px;
        border-radius: 6px;
        background-color: var(--color-text);
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 3;
    }

    .svg-dot {
        background: none;
        overflow: visible;
        pointer-events: none;
    }
</style>