/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8B5CF6', // Purple
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
        },
        secondary: {
          light: '#F97316', // Orange
          DEFAULT: '#EA580C',
          dark: '#C2410C',
        },
        accent: {
          light: '#38BDF8', // Blue
          DEFAULT: '#0EA5E9',
          dark: '#0284C7',
        }
      },
    },
  },
  plugins: [],
} 