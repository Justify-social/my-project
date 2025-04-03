/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: '#333333',    // Jet
        secondary: '#4A5568',  // Payne's Grey
        accent: '#00BFFF',     // Deep Sky Blue
        background: '#FFFFFF', // White
        divider: '#D1D5DB',    // French Grey
        interactive: '#3182CE', // Medium Blue
        border: 'hsl(var(--border))', // Required for shadcn/ui components
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
      },
      textColor: {
        foreground: 'hsl(var(--foreground))',
      },
      backgroundColor: {
        background: 'hsl(var(--background))',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}