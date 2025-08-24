import { ref, onMounted, onBeforeUnmount } from 'vue';

const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);


export function useWindowSize() {
    const updateSize = () => {
        windowWidth.value = window.innerWidth;
        windowHeight.value = window.innerHeight;
    };

    onMounted(() => {
        window.addEventListener('resize', updateSize);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', updateSize);
    });

    return {
        windowWidth,
        windowHeight
    };
};