<script setup>
    import { GridLayout } from 'grid-layout-plus';
    import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
    import { motion } from 'motion-v';
    import DataVisualisation from '@/components/data-visualisation/DataVisualisation.vue';
    
    const demoSeries = [
        { name: 'created', data: [10, 20, 5, 30, 40, 25] },
        { name: 'closed', data: [8, 15, 7, 28, 35, 20] }
    ];

    const demoOptions = {
        chart: { id: 'tickets-by-month' },
        xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    }

    import DashboardDataTile from '@/components/data-visualisation/DashboardDataTile.vue';
    import DashboardCarousel from '@/components/data-visualisation/DashboardCarousel.vue';
    import RouteInfo from '@/components/common/RouteInfo.vue';
    import SearchBar from '@/components/user-input/SearchBar.vue';
    import FilterDatePicker from '@/components/user-input/FilterDatePicker.vue';

    const containerWidth = ref(0);
    const STORAGE_KEY = 'dashboardTileLayout';
    const colNum = ref(3);
    const maxTilesAmount = 9;
    const savedLayout = localStorage.getItem(STORAGE_KEY);
    const rowHeight = ref(null);
    
    const isChecked = ref(false);
    const dateRange = ref(null);
    const searchInput = ref('');

    const layout = ref( savedLayout ? JSON.parse(savedLayout) : [
        { x: 0, y: 0, w: 1, h: 1, i: '0' },
        { x: 1, y: 0, w: 1, h: 1, i: '1' }
    ]);

    const originalLayout = ref(null);

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

        isChecked.value = true;

        layout.value.push({
            x: 0,
            y: 0,
            w: 1,
            h: 1,
            i: uniqueId
        });

        layout.value = packLayout(layout.value);

        setTimeout(() => {
            isChecked.value = false;
        }, 1500)
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
            if (colNum.value === 1) {
                rowHeight.value = window.innerWidth * 0.9;
            } else {
                rowHeight.value = (containerWidth.value / colNum.value) * 0.7;
            }
        }
    };

    onMounted(() => {
        const wrapper = document.querySelector('.dashboard-view-wrapper');
        containerWidth.value = wrapper.clientWidth;

        handleScreenResize();
        window.addEventListener('resize', handleScreenResize);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', handleScreenResize);
    });

    watch(layout, (newLayout) => {
        if (!originalLayout.value) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
        }
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
                for (let x = 0; x <= colNum.value - tile.w; x++) {
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

    const handleScreenResize = () => {
        containerWidth.value = document.querySelector('.dashboard-view-wrapper').clientWidth;
        
        if (window.innerWidth <= 635) {
            colNum.value = 1;            

            if (!originalLayout.value) {
                originalLayout.value = JSON.parse(JSON.stringify(layout.value));
            }
            
            layout.value = packLayout(layout.value.map(tile => ({ ...tile, w:1, h:1 })));
        } else {
            colNum.value = 3;

            if (originalLayout.value) {
                layout.value = JSON.parse(JSON.stringify(originalLayout.value));
                originalLayout.value = null;
            }
        }

        updateRowHeight();
    };

    const handleClearPreferences = () => {
        searchInput.value = '';
        dateRange.value = null;
    }

    const iconVariants = {
    plus: {
        d: "M12 5v14M5 12h14",
        rotate: 0,
        transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        },
    },
    check: {
        d: "M5 13l4 4L19 7",
        rotate: 365,
        transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        },
    },
    };
</script>

<template>
    <div class="dashboard-view-wrapper" >
        <div class="dashboard-header-items">
            <RouteInfo/>
            <SearchBar v-model="searchInput"/>
            <FilterDatePicker v-model="dateRange"/>
            <motion.button 
                class="clear-filter-button"
                @click="handleClearPreferences"
                :while-press="{
                    scale: 0.97
                }"
            >
                Clear preferences
            </motion.button>
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
                <DataVisualisation
                    :chartId="item.i"
                    type="bar"
                    :series="demoSeries"
                    :options="demoOptions"
                />
            </DashboardDataTile>
        </GridLayout>

        <motion.button 
            v-if="layout.length < maxTilesAmount"
            class="add-menu-tile-button"
            :class="isChecked ? 'checked' : ''"
            @click="addLayoutTile"
            :disabled="isChecked"
            :initial="false"
            :animate="isChecked ? 'checked' : 'default'"
            :variants="{
                default: { backgroundColor: 'var(--color-highlight)' },
                checked: { backgroundColor: 'var(--vt-c-green)' }
            }"
            :transition="{ duration: 0.5 }"
        >
            <motion.svg
                class="add-menu-checkmark"
                viewBox="0 0 24 24"
                width="24"
                height="24"
            >
                <motion.path
                    stroke="white"
                    fill="transparent"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :initial="false"
                    :animate="isChecked ? 'check' : 'plus'"
                    :variants="iconVariants"
                />
            </motion.svg>
        </motion.button>
    </div>
</template>

<style>
    .dashboard-header-items {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 48px;
        padding: 16px 0;
    }

    .clear-filter-button {
        background-color: var(--color-menu-background);
        color: var(--text-color);
        font-size: 11px;
        font-weight: 700;
        font-family: 'Noto Sans JP';
        padding: 6px 24px;
        border: 1px solid var(--vt-c-offwhite);
        border-radius: 4px;
        cursor: pointer;
        white-space: nowrap;
    }

    .dashboard-view-wrapper {
        overflow-y: auto;
    }

    .dashboard-view-wrapper::-webkit-scrollbar {
        display: none;
    }

    .add-menu-tile-button {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        bottom: 32px;
        right: 0px;
        padding: 8px 12px;
        box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.25);
        border-radius: 4px 0 0 4px;
        cursor: pointer;
    }

    .add-menu-tile-button.checked {
        cursor: default;
    }

    .add-menu-checkmark {
        background: none;
        overflow: visible;
        pointer-events: none;
    }

    @media (max-width: 635px) {
        .dashboard-header-items {
            display: none;
        }
    }
</style>