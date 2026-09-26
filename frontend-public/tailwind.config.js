/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        kelu: {
          teal: '#0F6E6E',
          gold: '#C9962C',
          cream: '#FAF7F2',
          ink: '#1E2A2A',
        },
      },
    },
  },
  plugins: [],
};
