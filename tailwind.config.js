/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0F1117',
          card: '#1A1D27',
          elevated: '#242836',
        },
        accent: {
          DEFAULT: '#FF6B35',
          hover: '#FF8555',
        },
        teal: {
          DEFAULT: '#2DD4BF',
          hover: '#5EEAD4',
        },
      },
    },
  },
  plugins: [],
};
