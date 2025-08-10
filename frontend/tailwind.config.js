/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A90E2', // Azul Sereno
          light: '#D4E6FB',   // Azul Claro
          dark: '#357ABD',    // Azul más oscuro para hover
        },
        success: {
          DEFAULT: '#6CC070', // Verde Esperanza
          light: '#A8E6AC',   // Verde claro
          dark: '#5AA85E',    // Verde más oscuro
        },
        neutral: {
          DEFAULT: '#F5F5F5', // Gris Cálido
          text: '#4A4A4A',    // Gris Texto
          dark: '#2D2D2D',    // Gris oscuro para modo oscuro
          darker: '#1A1A1A',  // Gris más oscuro para modo oscuro
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
