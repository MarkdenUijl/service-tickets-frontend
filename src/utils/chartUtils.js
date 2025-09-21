export const deepMerge = (target, source) => {
  const out = Array.isArray(target) ? [...target] : { ...target };
  
  for (const [k, v] of Object.entries(source || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMerge(out[k] || {}, v);
    } else out[k] = v;
  }

  return out;
};

export const isNumberArray = (arr) => Array.isArray(arr) && arr.every(v => typeof v === 'number');

export const baseOptions = {
  chart: {
    fontFamily: 'Ubuntu',
    foreColor: 'var(--color-text)',
    toolbar: { show: false },
    animations: { enabled: true },
    redrawOnParentResize: true,
    redrawOnWindowResize: true,
    zoom: { enabled: false }
  },
  dataLabels: { enabled: false },
  legend: { show: true, fontSize: '10px', markers: { shape: 'circle', offsetX: -4, size: 4, strokeWidth: 0 } },
  noData: { text: 'No data' },
  states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
  tooltip: { x: { show: false } }
};

export const makeBaseOptions = (chartRef) => deepMerge(baseOptions, {
  chart: {
    events: {
      mounted: () => {
        requestAnimationFrame(() => {
          const inst = chartRef.value?.chart;
          if (inst?.updateOptions) inst.updateOptions({}, true, true);
          else window.dispatchEvent(new Event('resize'));
        });
      }
    }
  }
});

export const updateChartSize = (chartRef) => {
  const inst = chartRef.value?.chart
  if (inst?.updateOptions) inst.updateOptions({}, true, true)
  else window.dispatchEvent(new Event('resize'))
}

export const normalizeCartesianSeries = (series) => {
  if (isNumberArray(series)) {
    return [{ name: 'Series 1', data: series }]
  }
  return series
}

export const normalizeRadialSeries = (series, options) => {
  if (isNumberArray(series)) return { series, extraOptions: {} }
  if (Array.isArray(series) && series.length && typeof series[0] === 'object') {
    const labels = []
    const values = []
    for (const item of series) {
      const label = item.label ?? item.name
      const value = item.value ?? item.y
      if (typeof value === 'number') {
        values.push(value)
        labels.push(label ?? String(values.length))
      }
    }
    return { series: values, extraOptions: options?.labels ? {} : { labels } }
  }
  return { series, extraOptions: {} }
}