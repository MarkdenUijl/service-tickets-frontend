<script setup>
    import { GridLayout } from 'grid-layout-plus';
    import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

    import DashboardDataTile from '@/components/common/DashboardDataTile.vue';
    import DashboardCarousel from '@/components/common/DashboardCarousel.vue';
import RouteInfo from '@/components/common/RouteInfo.vue';

    const containerWidth = ref(0);
    const colNum = 3;
    const STORAGE_KEY = 'dashboardTileLayout';

    const savedLayout = localStorage.getItem(STORAGE_KEY);
    const rowHeight = ref(100);

    const layout = ref( savedLayout ? JSON.parse(savedLayout) : [
        { x: 0, y: 0, w: 1, h: 1, i: '0' },
        { x: 1, y: 0, w: 1, h: 1, i: '1' }
    ]);

    const cards = [
        {
            cardTitle: "Open tickets",
            cardInfo: 52
        },{
            cardTitle: "Escalated tickets",
            cardInfo: 10
        },{
            cardTitle: "Awaiting response",
            cardInfo: 16
        },{
            cardTitle: "Client responded",
            cardInfo: 22
        },{
            cardTitle: "Unlinked tickets",
            cardInfo: 4
        }
    ];

    const addLayoutTile = () => {
        const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        layout.value.push({
            x: 0,
            y: 0,
            w: 1,
            h: 1,
            i: uniqueId
        });

        layout.value = packLayout(layout.value);
    };

    const deleteLayoutTile = (id) => {
        const index = layout.value.findIndex( tile => tile.i === id );

        if (index > -1) {
            layout.value.splice(index, 1);
        };

        layout.value = packLayout(layout.value);
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
        const grid = [];
        const packed = [];

        const isFree = (x, y, w, h) => {
            for (let dy = 0; dy < h; dy++) {
                for (let dx = 0; dx < w; dx++) {
                    const row = grid[y + dy] || [];
                    if (row[x + dx]) return false;
                }
            }
            return true;
        };

        const occupy = (id, x, y, w, h) => {
            for (let dy = 0; dy < h; dy++) {
                if (!grid[y + dy]) grid[y + dy] = [];
                for (let dx = 0; dx < w; dx++) {
                    grid[y + dy][x + dx] = id;
                }
            }
        };

        for (const tile of items) {
            let placed = false;

            for (let y = 0; !placed; y++) {
                for (let x = 0; x <= colNum - tile.w; x++) {
                    if (isFree(x, y, tile.w, tile.h)) {
                        packed.push({ ...tile, x, y });
                        occupy(tile.i, x, y, tile.w, tile.h);
                        placed = true;
                        break;
                    }
                }
            }
        }

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
            <RouteInfo/>
            <button @click="addLayoutTile">ADD LAYOUT TILE</button>
        </div>

        <DashboardCarousel :cards="cards"/>

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

    .dashboard-view-wrapper::-webkit-scrollbar {
        display: none;
    }
</style>