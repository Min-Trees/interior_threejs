/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf8f5',
          100: '#f5efe8',
          200: '#eadccf',
          300: '#dec4b0',
          400: '#c59d7d',
          500: '#af7e59',
          600: '#9b6748',
          700: '#7c4f39',
          800: '#644131',
          900: '#52372a',
          950: '#2b1b15',
        },
        gold: {
          400: '#e0a94b',
          500: '#cb9131',
          600: '#b17623',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
