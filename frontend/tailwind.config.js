/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#43A047',
          DEFAULT: '#388E3C',
          dark: '#2E7D32',
        },
        secondary: {
          light: '#BA68C8',
          DEFAULT: '#8E24AA',
          dark: '#7B1FA2',
        },
      },
    },
  },
  plugins: [],
}

