import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

export function useStableSize(targetRef, delay = 150) {
    const ready = ref(false);
    const width = ref(0);
    const height = ref(0);

    let ro = null;
    let timer = null;

    const clear = () => {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    };

    const scheduleReady = () => {
        clear();

        if (width.value > 0 && height.value > 0) {
            timer = window.setTimeout(() => {
                ready.value = true;
            }, delay);
        } else {
            ready.value = false;
        };
    };

    const ensureObserver = () => {
        if (!ro) {
        ro = new ResizeObserver((entries) => {
            const cr = entries[0].contentRect;
            const w = Math.round(cr.width);
            const h = Math.round(cr.height);
            if (w !== width.value || h !== height.value) {
            width.value = w; height.value = h;
            ready.value = false;
            scheduleReady();
            }
        });
        }
    };

    onMounted(() => {
        const el = targetRef.value;
        if (!el) return;
        ensureObserver();
        ro.observe(el);
        
        const rect = el.getBoundingClientRect();
        width.value = Math.round(rect.width);
        height.value = Math.round(rect.height);
        scheduleReady();
    });

    onBeforeUnmount(() => {
        clear();
        ro?.disconnect();
        ro = null;
    });

    watch(() => targetRef.value, (el, prev) => {
        if (prev && ro) ro.unobserve(prev);
        if (el) {
            ensureObserver();
            ro.observe(el);
            
            const rect = el.getBoundingClientRect();
            width.value = Math.round(rect.width);
            height.value = Math.round(rect.height);
            ready.value = false;
            scheduleReady();
            }
    });

    return { ready, width, height }
}