/**
 * Deep merge utility.
 * WHY: ApexCharts options objects are nested; shallow merge would overwrite
 * entire sub-objects. This ensures nested objects merge recursively.
 */
export const deepMerge = (target, source) => {
  const out = Array.isArray(target) ? [...target] : { ...target }

  for (const [k, v] of Object.entries(source || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMerge(out[k] || {}, v)
    } else {
      out[k] = v
    }
  }

  return out
}

// Utility: check if value is an array of numbers
export const isNumberArray = (arr) => Array.isArray(arr) && arr.every(v => typeof v === 'number')

// Base ApexCharts options used across all charts
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
  legend: {
    show: true,
    fontSize: '10px',
    markers: { shape: 'circle', offsetX: -4, size: 4, strokeWidth: 0 }
  },
  noData: { text: 'No data' },
  states: {
    hover: { filter: { type: 'none' } },
    active: { filter: { type: 'none' } }
  },
  tooltip: { x: { show: false } }
}

/**
 * Adds base event handling to chart options.
 * WHY: ApexCharts sometimes misses resize events; calling updateOptions with
 * empty object forces it to recompute layout.
 */
export const makeBaseOptions = (chartRef) =>
  deepMerge(baseOptions, {
    chart: {
      events: {
        mounted: () => {
          requestAnimationFrame(() => {
            const inst = chartRef.value?.chart
            if (inst?.updateOptions) inst.updateOptions({}, true, true)
            else window.dispatchEvent(new Event('resize'))
          })
        }
      }
    }
  })

/**
 * Force chart to recompute size.
 * WHY: Some layout containers resize without triggering ApexCharts updates.
 */
export const updateChartSize = (chartRef) => {
  const inst = chartRef.value?.chart
  if (inst?.updateOptions) inst.updateOptions({}, true, true)
  else window.dispatchEvent(new Event('resize'))
}

/**
 * Normalize cartesian series to standard ApexCharts format.
 * WHY: Accepts shorthand (array of numbers) and converts it into full series.
 */
export const normalizeCartesianSeries = (series) => {
  if (isNumberArray(series)) {
    return [{ name: 'Series 1', data: series }]
  }
  return series
}

/**
 * Normalize radial series input into ApexCharts format.
 * WHY: Radial charts can be provided as numbers, objects, or already-normalized.
 * This function makes sure ApexCharts receives `{ series, extraOptions }`.
 */
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