<script setup>
    import { GridLayout } from 'grid-layout-plus';
    import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

    import DashboardDataTile from '@/components/common/DashboardDataTile.vue';
    import DashboardCarousel from '@/components/common/DashboardCarousel.vue';

    const containerWidth = ref(0);
    const colNum = 3;
    const STORAGE_KEY = 'dashboardTileLayout';

    const savedLayout = localStorage.getItem(STORAGE_KEY);
    const rowHeight = ref(100);

    const layout = ref( savedLayout ? JSON.parse(savedLayout) : [
        { x: 0, y: 0, w: 1, h: 1, i: '0' },
        { x: 1, y: 0, w: 1, h: 1, i: '1' }
    ]);

    const addLayoutTile = () => {
        const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        layout.value.push({
            x: 0,
            y: 0,
            w: 1,
            h: 1,
            i: uniqueId
        });

        packLayout(layout.value);
    };

    const deleteLayoutTile = (id) => {
        const index = layout.value.findIndex( tile => tile.i === id );

        if (index > -1) {
            layout.value.splice(index, 1);
        };

        packLayout(layout.value);
    };


    const updateRowHeight = () => {
        if (containerWidth.value > 0) {
            rowHeight.value = (containerWidth.value / colNum) * 0.7;
        }
    };

    onMounted(() => {
        const wrapper = document.querySelector('.dashboard-view-wrapper');
        containerWidth.value = wrapper.clientWidth;
        updateRowHeight();

        window.addEventListener('resize', () => {
            containerWidth.value = wrapper.clientWidth;
            updateRowHeight();
        });
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', updateRowHeight);
    });

    watch(layout, (newLayout) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
    }, { deep: true });

    const packLayout = (items) => {
        let x = 0;
        let y = 0;
        let rowHeightTracker = 0;
        const packed = [];

        for (const tile of items) {
            if (x + tile.w > colNum) {
                x = 0;
                y += rowHeightTracker;
                rowHeightTracker = 0;
            }

            packed.push({
                ...tile,
                x,
                y
            });

            x += tile.w;
            rowHeightTracker = Math.max(rowHeightTracker, tile.h);
        };

        return packed;
    };

    const handleResizeRequest = ({ id, w, h }) => {
        const updated = layout.value.map(tile =>
            tile.i === id ? { ...tile, w, h } : tile
        );

        updated.sort((a, b) => a.y - b.y || a.x - b.x);

        layout.value = packLayout(updated);
    };
    
</script>

<template>
    <div class="dashboard-view-wrapper" >
        <div class="dashboard-nav-items">
            <button @click="addLayoutTile">ADD LAYOUT TILE</button>
        </div>

        <DashboardCarousel/>

        <GridLayout
            v-model:layout="layout"
            :col-num="colNum"
            :row-height="rowHeight"
            is-draggable
            :is-resizable="false"
            vertical-compact
            use-css-transforms
            :prevent-collision="false"
        >
            <DashboardDataTile
                v-for="item in layout"
                :key="item.i"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                @resizeRequest="handleResizeRequest"
                @deletionRequest="deleteLayoutTile"
            >
                {{ item.i }}
            </DashboardDataTile>
        </GridLayout>
    </div>
</template>

<style>
    .dashboard-nav-items {
        width: 100%;
        background-color: aqua;
        height: 100px;
    }

    .dashboard-view-wrapper {
        overflow-y: auto;
    }

    
</style>