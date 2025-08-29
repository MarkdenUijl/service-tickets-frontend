<script setup>
    import { computed } from 'vue';
    import VueApexCharts from 'vue3-apexcharts';

    const apexchart = VueApexCharts;

    const props = defineProps({
        type: { type: String, default: 'bar' },
        series: { type: Array, default: () => [] },
        width: { type: [Number, String], default: '100%' },
        height: { type: [Number, String], default: '100%' },
        options: { type: Object, default: () => ({}) },
        chartId: { type: String, default: '' }
    });

    const baseOptions = {
        chart: {
            toolbar: { show: false },
            animations: { enabled: true }
        },
        colors: ['var(--vt-c-pink)', 'var(--vt-c-red)', 'var(--vt-c-salmon)', 'var(--vt-c-gold)', 'var(--vt-c-teal)'],
        dataLabels: { enabled: false },
        stroke: { width: 2 },
        legend: { show: true },
        grid: { strokeDashArray: 3 },
        tooltip: { shared: true, intersect: false },
        noData: { text: 'No data' },
    };

    const deepMerge = (target, source) => {
        const out = Array.isArray(target) ? [...target] : { ...target };

        for (const [key, value] of Object.entries(source || {})) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                out[key] = deepMerge(out[key] || {}, value);
            } else {
                out[key] = value;
            };
        };

        return out;
    };

    const isNumberArray = (arr) => Array.isArray(arr) && arr.every(v => typeof v === 'number');

    const normalized = computed(() => {
        const t = String(props.type || '').toLowerCase();

        let seriesOut = props.series;
        const extraOptions = {};

        if (t === 'pie' || t === 'donut' || t === 'radialbar') {
            if (isNumberArray(props.series)) {
                seriesOut = props.series;
            } else if (Array.isArray(props.series) && props.series.length && typeof props.series[0] === 'object') {
                const labels = [];
                const values = [];

                for (const item of props.series) {
                    const label = item.label ?? item.name;
                    const value = item.value ?? item.y ?? (Array.isArray(item.data) ? undefined : item.data)

                    if (typeof value === 'number') {
                        values.push(value);
                        labels.push(label ?? String(values.length))
                    };
                };

                if (values.length) {
                    seriesOut = values;

                    if (!props.options?.labels) {
                        if (Array.isArray(props.options?.xaxis?.categories)) {
                            extraOptions.labels = props.options.xaxis.categories;
                        } else {
                            extraOptions.labels = labels;
                        };
                    };
                };
            };
        } else if (t === 'bar' || t === 'line' || t === 'area' || t === 'scatter') {
            if (isNumberArray(props.series)) {
                seriesOut = [{ name: 'Series 1', data: props.series }];
            }
        }

        return { series: seriesOut, extraOptions };
    });

    const mergedOptions = computed(() => {
        const withId = props.chartId
        ? deepMerge(baseOptions, { chart: { id: props.chartId } })
        : { ...baseOptions };

        return deepMerge(withId, { ...props.options, ...normalized.value.extraOptions });
    });
</script>

<template>
    <div class="chart-container">
        <apexchart
            :type="type"
            :options="mergedOptions"
            :series="normalized.series"
            :width="width"
            :height="height"
        />
    </div>
</template>

<style scoped>
    .chart-container {
        background-color: aquamarine;
        width: 100%;
        height: 100%;
    }
</style>