export default {
  plugins: [
    {
      name: 'removeDimensions',
    },
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },
    {
      name: 'prefixIds'
    },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          { preserveAspectRatio: 'none' },
        ],
      },
    }
  ],
};