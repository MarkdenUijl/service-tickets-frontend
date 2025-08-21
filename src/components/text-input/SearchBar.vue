<script setup> 
    import { ref } from 'vue';

    let input = ref('');

    // temporary search bar filling
    const fruits = ['apple', 'pear', 'banana', 'orange', 'lemon', 'lime'];

    const filteredList = () => {
        return fruits.filter((fruit) => 
            fruit.toLowerCase().includes(input.value.toLowerCase())
        );
    };
</script>

<template>
    <div class="search-bar-container">
        <input class="search-bar" type="text" v-model="input" placeholder="Search projects..."/>
    
        <div class="search-results" v-if="input">
            <div 
                class="search-item" 
                v-for="listItem in filteredList()" 
                :key="listItem"
            >
                <p>{{ listItem }}</p>
            </div>
        
            <div class="search-item no-results" v-if="!filteredList().length">
                <p>No results found...</p>
            </div>
        </div>
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
        z-index: 1000;
        overflow: hidden;
    }

    .search-item {
        padding: 12px 16px;
        cursor: pointer;
        transition: background 0.2s;
        color: var(--color-text);
    }

    .search-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .no-results {
        color: var(--color-subtext);
        font-style: italic;
    }
</style>