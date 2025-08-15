<script setup>
    import { GridItem } from 'grid-layout-plus';

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
        <!-- <div class="tile-menu"></div> -->
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
        border-radius: 8px;
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
</style>