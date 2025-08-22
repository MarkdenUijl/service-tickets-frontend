<script setup> 
    import { ref } from 'vue';
    import { motion, AnimatePresence } from 'motion-v'

    let input = ref('');

    // temporary search bar filling
    const fruits = ['apple', 'pear', 'banana', 'orange', 'lemon', 'lime', 'potato', 'mandarin', 'tomato'];

    const filteredList = () => {
        return fruits.filter((fruit) => 
            fruit.toLowerCase().includes(input.value.toLowerCase())
        );
    };
</script>

<template>
    <div class="search-bar-container">
        <input class="search-bar" type="text" v-model="input" placeholder="Search projects..."/>
        
        <AnimatePresence>
            <motion.div 
                class="search-results" 
                v-if="input"
                layout
                :initial="{ opacity: 0, scaleY: 0, transformOrigin: 'top' }"
                :animate="{ opacity: 1, scaleY: 1, transformOrigin: 'top' }"
                :exit="{ opacity: 0, scaleY: 0, transformOrigin: 'top' }"
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
                >
                    <p>{{ listItem }}</p>
                </motion.div>
            
                <div class="search-item no-results" v-if="!filteredList().length">
                    <p>No results found...</p>
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
        padding: 16px 24px;
        font-size: 16px;
        box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
        outline: none;
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