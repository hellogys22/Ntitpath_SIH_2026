/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govNavy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          500: '#1E3A8A',
          700: '#0F2C59',
          800: '#0B2545',
          900: '#081B33',
          950: '#051124',
        },
        govSaffron: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412',
        },
        govGreen: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#16A34A',
          600: '#15803D',
          700: '#166534',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
