<script setup>
    import { onBeforeUnmount, onMounted, ref } from 'vue';
    import SvgIcon from '../svg-icon/SvgIcon.vue';

    const props = defineProps({
        cards: { type: Array, required: true }
    });

    const containerEl = ref(null);
    const trackEl = ref(null);

    const currentIndex = ref(0);
    const cardStep = ref(0);
    const visibleCount = ref(1);
    const maxIndex = ref(props.cards.length - visibleCount.value);
    const maxOffset = ref(0);

    const measure = () => {
        const firstCard = trackEl.value?.querySelector('.carousel-card');
        const carouselNavButton = document.getElementById('carousel-back-button');
        const navButtonWidth = carouselNavButton?.getBoundingClientRect().width || 0;

        const cardWidth = firstCard?.getBoundingClientRect().width || 0;
        const styles = window.getComputedStyle(trackEl.value);
        const gap = parseFloat(styles.columnGap || styles.gap) || 0;

        cardStep.value = cardWidth + gap;

        const containerWidth = containerEl.value.clientWidth;
        const viewportWidth = Math.max(0, containerWidth - (navButtonWidth));
        visibleCount.value = Math.max(1, Math.floor((viewportWidth + gap) / cardStep.value));

        const trackWidth = props.cards.length * cardStep.value - gap;
        maxOffset.value = Math.max(0, trackWidth - viewportWidth);

        maxIndex.value = Math.max(0, props.cards.length - visibleCount.value);

        currentIndex.value = Math.min(currentIndex.value, maxIndex.value);
    };

    const carouselForward = () => {
        measure();
        if (currentIndex.value < maxIndex.value) {
            currentIndex.value += 1;
        }
    };

    const carouselBackward = () => {
        measure();
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
    <div class="carousel-wrapper">
        <div class="carousel" ref="containerEl">
            <div 
                id="carousel-back-button" 
                class="carousel-button"
                @click="carouselBackward"
                v-show="currentIndex > 0"
            >
                <SvgIcon name="icon-arrow-left" height="20px" width="20px"/>
            </div>
    
            <div 
                class="carousel-track" 
                ref="trackEl"
                :style="{ transform: `translateX(-${currentIndex === maxIndex ? maxOffset : currentIndex * cardStep}px)` }"    
            >
                <div 
                    class="carousel-card"
                    v-for="card in props.cards"
                    :key="card"
                >
                    {{ card }}
                </div>
            </div>
    
            <div 
                id="carousel-next-button" 
                class="carousel-button"
                @click="carouselForward"
                v-show="currentIndex < maxIndex"
            > 
                <SvgIcon name="icon-arrow-right" height="20px" width="20px"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .carousel-wrapper {
        width: 100%;
        padding: 0 10px;
        user-select: none;
    }

    .carousel {
        width: 100%;
        overflow: hidden;
        position: relative;
    }

    .carousel-track {
        display: flex;
        gap: 24px;
        transition: transform 0.3s ease-in-out;
    }

    .carousel-card {
        min-width: 260px;
        height: 120px;
        display: inline-flex;
        background-color: var(--color-menu-background);
        color: var(--color-text);
        border-radius: 12px;
        align-items: center;
        justify-content: center;
    }

    .carousel-button {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: none;
        opacity: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 3;
        cursor: pointer;
    }

    .carousel-button:hover {
        background-color: rgba(0,0,0,0.4);
        color: white;
        opacity: 1;
    }

    #carousel-next-button {
        right: 8px;
        padding-left: 4px;
    }

    #carousel-back-button {
        left: 8px;
        padding-right: 4px;
    }
</style>