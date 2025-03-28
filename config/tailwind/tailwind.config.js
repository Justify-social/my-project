// This file contains the Tailwind CSS configuration

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#333333',     // Jet
        secondary: '#4A5568',   // Payne's Grey
        accent: '#00BFFF',      // Deep Sky Blue
        background: '#FFFFFF',  // White
        divider: '#D1D5DB',     // French Grey
        interactive: '#3182CE', // Medium Blue
      },
    },
  },
  plugins: [],
};