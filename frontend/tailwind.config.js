/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#ffffff',
          card: '#ffffff',
          border: '#e5e7eb',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        italiana: ['Italiana', 'serif'],
        bodoni: ['Bodoni Moda', 'serif'],
      },
    },
  },
  plugins: [],
};
