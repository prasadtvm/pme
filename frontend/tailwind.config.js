/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This sets 'Arial' as the primary sans font, then Helvetica, then default system sans
        sans: ['Arial', 'Helvetica', ...defaultTheme.fontFamily.sans],
        // Optional alias for Arial, if you want to use "font-arial"
        arial: ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

