/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#2E2926',
        coffee: '#5B504B',
        sage: '#AFA69E',
        clay: '#B65A2A',
        linen: '#F6F4EA',
        cream: '#FFFDF4',
        wine: '#7A1F22',
        gold: '#C28A2E',
        moss: '#4F5A38',
      },
      boxShadow: {
        soft: '0 20px 50px rgba(46, 41, 38, 0.12)',
      },
    },
  },
  plugins: [],
};
