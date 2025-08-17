<script setup>
    import { onBeforeUnmount } from 'vue';
import { onMounted } from 'vue';
import { ref } from 'vue';

    const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    const containerEl = ref(null);
    const trackEl = ref(null);

    const currentIndex = ref(0);
    const cardStep = ref(0);
    const visibleCount = ref(1);
    const maxIndex = ref(cards.length - visibleCount.value);

    const measure = () => {
        const firstCard = trackEl.value?.querySelector('.carousel-card');
        const cardWidth = firstCard?.getBoundingClientRect().width || 0;

        const styles = window.getComputedStyle(trackEl.value);
        const gap = parseFloat(styles.columnGap || styles.gap) || 0;

        cardStep.value = cardWidth + gap;

        const containerWidth = containerEl.value.clientWidth;
        visibleCount.value = Math.max(1, Math.floor((containerWidth + gap) / cardStep.value));

        maxIndex.value = Math.max(0, cards.length - visibleCount.value);

        if (currentIndex.value > maxIndex.value) {
            currentIndex.value = maxIndex.value;
        }
    };

    const carouselForward = () => {
        if (currentIndex.value < maxIndex.value) {
            currentIndex.value += 1;
        }
    };

    const carouselBackward = () => {
        if (currentIndex.value > 0) {
            currentIndex.value -= 1;
        }
    };

    onMounted(() => {
        measure();
        window.addEventListener('resize', measure);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', measure);
    })
</script>

<template>
    <div class="carousel" ref="containerEl">
        <div 
            id="carousel-back-button" 
            class="carousel-button"
            @click="carouselBackward"
        />

        <div 
            class="carousel-track" 
            ref="trackEl"
            :style="{ transform: `translateX(-${currentIndex * cardStep}px)` }"    
        >
            <div 
                class="carousel-card"
                v-for="card in cards"
                :key="card"
            >
                {{ card }}
            </div>
        </div>

        <div 
            id="carousel-next-button" 
            class="carousel-button"
            @click="carouselForward"
        />
    </div>
</template>

<style scoped>
    .carousel {
        width: 100%;
        overflow: hidden;
        position: relative;
    }

    .carousel-track {
        display: flex;
        gap: 24px;
        transition: transform 0.2s;
    }

    .carousel-card {
        min-width: 260px;
        height: 120px;
        display: inline-flex;
        background-color: blue;
        color: white;
        border-radius: 4px;
        align-items: center;
        justify-content: center;
    }

    .carousel-button {
        width: 20px;
        height: 100%;
        position: absolute;
        background-color: blueviolet;
        z-index: 3;
        cursor: pointer;
    }

    #carousel-next-button {
        right: 0;
        top: 0;
    }
</style>