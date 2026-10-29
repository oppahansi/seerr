// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './node_modules/@seerr-team/react-tailwindcss-datepicker/dist/index.esm.js',
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      transitionProperty: {
        'max-height': 'max-height',
        width: 'width',
      },
      fontFamily: {
        sans: ['Quicksand', 'Inter Variable', ...defaultTheme.fontFamily.sans],
      },
      // Kaleidochromic palette (ported from the Jellyfin ThemeSwitcher theme)
      colors: {
        gray: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d0d0d4',
          400: '#b5b5b5',
          500: '#5a5a62',
          600: '#3a3a40',
          700: '#26262b',
          800: '#18181c',
          900: '#080808',
        },
        indigo: {
          50: '#f0f3fc',
          100: '#e0e6f8',
          200: '#c4cff2',
          300: '#a3b3e8',
          400: '#8196dc',
          500: '#6279cd',
          600: '#5468b8',
          700: '#46579a',
          800: '#3a4680',
          900: '#2e3766',
        },
      },
      purple: {
        50: '#f3f2fc',
        100: '#e6e4f8',
        200: '#cdc9f1',
        300: '#b0aae8',
        400: '#9188dc',
        500: '#7a74d3',
        600: '#6a68c4',
        700: '#5654a4',
        800: '#444383',
        900: '#363568',
      },
      borderRadius: {
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.indigo.500'),
              '&:hover': {
                color: theme('colors.indigo.400'),
              },
            },

            h1: {
              color: theme('colors.gray.300'),
            },
            h2: {
              color: theme('colors.gray.300'),
            },
            h3: {
              color: theme('colors.gray.300'),
            },
            h4: {
              color: theme('colors.gray.300'),
            },
            h5: {
              color: theme('colors.gray.300'),
            },
            h6: {
              color: theme('colors.gray.300'),
            },

            strong: {
              color: theme('colors.gray.400'),
            },

            code: {
              color: theme('colors.gray.300'),
            },

            figcaption: {
              color: theme('colors.gray.500'),
            },
          },
        },
      }),
    },
    aspectRatio: {
      auto: 'auto',
      square: '1 / 1',
      video: '16 / 9',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
      11: '11',
      12: '12',
      13: '13',
      14: '14',
      15: '15',
      16: '16',
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/forms'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/typography'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/aspect-ratio'),
  ],
};
