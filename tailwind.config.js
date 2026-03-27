/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f4f5f8',
          100: '#e5e7f0', // Glass border
          200: '#ccd0df',
          300: '#a7afc8',
          400: '#7c87ac',
          500: '#5a6692', // Slate text
          600: '#46517a',
          700: '#384263',
          800: '#303853',
          900: '#2a3146',
          950: '#0f121a', // Deep background
        },
        primary: {
          DEFAULT: '#6d28d9', // Deep electric purple
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        success: {
          DEFAULT: '#10b981', // Crisp Emerald
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      boxShadow: {
        'soft': '0 4px 24px -6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'glow': '0 10px 25px -5px rgba(109, 40, 217, 0.3)',
        'glow-success': '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
        'glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6), inset 0 0 20px 0 rgba(255, 255, 255, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-primary': 'radial-gradient(at 0% 0%, hsla(262,79%,50%,1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(271,91%,65%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(279,94%,56%,1) 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}
