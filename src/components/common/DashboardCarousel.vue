<script setup>
    import { onBeforeUnmount, onMounted, ref, computed } from 'vue';
    import { motion, AnimatePresence } from 'motion-v';
    import SvgIcon from '../svg-icon/SvgIcon.vue';

    const props = defineProps({
        cards: { type: Array, required: true }
    });

    const containerEl = ref(null);
    const trackEl = ref(null);

    const currentIndex = ref(0);
    const cardPositions = ref([]);
    const maxOffset = ref(0);
    const visibleCount = ref(1);
    const cardDynamicWidth = ref(null);

    let rafId = null;
    let resizeObserver = null;
    let mutationObserver = null;

    const measureNow = () => {
        if (!trackEl.value || !containerEl.value) return;

        const cards = Array.from(trackEl.value.querySelectorAll('.carousel-card'));
        if (!cards.length) {
            cardPositions.value = [];
            maxOffset.value = 0;
            visibleCount.value = 1;
            return;
        }

        const gapStr = getComputedStyle(trackEl.value).gap || getComputedStyle(trackEl.value).columnGap || '0px';
        const gap = parseFloat(gapStr) || 0;

        cardPositions.value = cards.map(c => c.offsetLeft);

        const trackScrollWidth = trackEl.value.scrollWidth;
        const viewportWidth = containerEl.value.clientWidth;

        maxOffset.value = Math.max(0, trackScrollWidth - viewportWidth);

        visibleCount.value = Math.max(1, Math.floor((viewportWidth + gap) / (cards[0].offsetWidth + gap)));

        if (props.cards.length <= visibleCount.value) {
            const totalGap = gap * (props.cards.length - 1);
            cardDynamicWidth.value = (viewportWidth - totalGap) / props.cards.length;
        } else {
            cardDynamicWidth.value = null;
        }

        currentIndex.value = Math.min(currentIndex.value, Math.max(0, props.cards.length - 1));
    };

    const cardStyle = computed(() => {
        if (cardDynamicWidth.value) {
            return {
                flex: `0 0 ${cardDynamicWidth.value}px`
            };
        }
        return {};
    });

    const measure = () => {
        if (rafId) cancelAnimationFrame(rafId);
        
        rafId = requestAnimationFrame(() => {
            measureNow();
            rafId = null;
        });
    };

    onMounted(() => {
        measure();

        window.addEventListener('resize', measure);

        resizeObserver = new ResizeObserver(measure);
        if (containerEl.value) resizeObserver.observe(containerEl.value);
        if (trackEl.value) resizeObserver.observe(trackEl.value);

        mutationObserver = new MutationObserver(measure);
        if (trackEl.value) mutationObserver.observe(trackEl.value, { childList: true, subtree: true, attributes: true });
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', measure);
        if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
        if (mutationObserver) { mutationObserver.disconnect(); mutationObserver = null; }
        if (rafId) cancelAnimationFrame(rafId);
    });

    const translateX = computed(() => {
        if (!cardPositions.value.length) return 0;
        const pos = cardPositions.value[currentIndex.value] ?? 0;
        return Math.min(pos, maxOffset.value);
    });

    const canGoBack = computed(() => translateX.value > 0);
    const canGoNext = computed(() => translateX.value < maxOffset.value);

    const carouselForward = () => {
        currentIndex.value = Math.min(currentIndex.value + 1, Math.max(0, props.cards.length - 1));
    };

    const carouselBackward = () => {
        currentIndex.value = Math.max(0, currentIndex.value - 1);
    };
</script>

<template>
    <div class="carousel-wrapper">
        <AnimatePresence>
            <motion.div 
                id="carousel-back-button" 
                class="carousel-button"
                @click="carouselBackward"
                :initial="{ opacity: 0 }"
                :while-hover="{ opacity: 1, scale: 1.1 }"
                :while-press="{ scale: 0.9 }"
                :exit="{ opacity: 0 }"
                :transition="{ duration: 0.3, easing: 'ease-in-out' }"
                v-if="canGoBack"
            >
                <SvgIcon name="icon-arrow-left" height="20px" width="20px"/>
            </motion.div>
        </AnimatePresence>

        <div 
            class="carousel" 
            ref="containerEl"
            :class="{ 'can-go-back': canGoBack, 'can-go-next': canGoNext }"
        >
            <div 
                class="carousel-track" 
                ref="trackEl"
                :style="{ transform: `translateX(-${translateX}px)` }"    
            >
                <div 
                    class="carousel-card"
                    v-for="(card, idx) in props.cards"
                    :key="idx"
                    :style="cardStyle"
                >
                    <span id="carousel-card-title">{{ card.cardTitle }}</span>
                    <span id="carousel-card-info">{{ card.cardInfo }}</span>
                </div>
            </div>
        </div>

        <AnimatePresence>
            <motion.div 
                id="carousel-next-button" 
                class="carousel-button"
                @click="carouselForward"
                :initial="{ opacity: 0 }"
                :while-hover="{ opacity: 1, scale: 1.1 }"
                :while-press="{ scale: 0.9 }"
                :exit="{ opacity: 0 }"
                :transition="{ duration: 0.3, easing: 'ease-in-out' }"
                v-if="canGoNext"
            > 
                <SvgIcon name="icon-arrow-right" height="20px" width="20px"/>
            </motion.div>
        </AnimatePresence>
    </div>
</template>

<style scoped>
    .carousel-wrapper {
        width: 100%;
        padding: 10px;
        user-select: none;
        position: relative;
    }

    .carousel {
        width: 100%;
        overflow-x: auto;
    }

    .carousel.can-go-back {
        mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 2.5%);
        mask-size: 100% 100%;
        mask-repeat: no-repeat;
        mask-position: 0 0;
    }

    .carousel.can-go-next {
        mask-image: linear-gradient(to right, rgba(0,0,0,1) 97.5%, rgba(0,0,0,0) 100%);
        mask-size: 100% 100%;
        mask-repeat: no-repeat;
        mask-position: 0 0;
    }

    .carousel::-webkit-scrollbar { 
        display: none;
    }

    .carousel-track {
        display: flex;
        gap: 24px;
        transition: transform 0.45s cubic-bezier(.34,1.56,.64,1);
        will-change: transform;
    }

    .carousel-card {
        min-width: 260px;
        max-height: 120px;
        display: flex;
        flex-direction: column;
        background-color: var(--color-menu-background);
        color: var(--color-text);
        border-radius: 12px;
        align-items: flex-start;
        justify-content: flex-start;
        flex-shrink: 0;
        padding: 16px 20px;
        font-family: 'Noto Sans JP';
    }

    #carousel-card-title {
        font-weight: 600;
        font-size: 16px;
    }

    #carousel-card-info {
        font-weight: 800;
        font-size: 38px;
    }

    .carousel-button {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(0,0,0,0.4);
        color: white;
        opacity: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 50%;
        translate: 0 -50%;
        z-index: 3;
        cursor: pointer;
    }

    #carousel-next-button {
        right: 18px;
        padding-left: 4px;
    }

    #carousel-back-button {
        left: 18px;
        padding-right: 4px;
    }
</style>