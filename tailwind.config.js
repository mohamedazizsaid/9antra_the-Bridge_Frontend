/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        bridge: {
          crimson:     '#C62761',
          gold:        '#F5A623',
          crimsonDark: '#9B1E4D',
          goldLight:   '#FFD07A',
          bg:          '#08081A',
          surface:     '#10102A',
          card:        '#171738',
          cardHover:   '#1F1F48',
          border:      '#2A2A5A',
          textPrimary: '#F0F0FF',
          textMuted:   '#8888BB',
          textSub:     '#5555AA',
        }
      },
      fontFamily: {
        syne:  ['Syne', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono:  ['Space Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '20px',
        '3xl': '28px',
      }
    },
  },
  plugins: [],
};
