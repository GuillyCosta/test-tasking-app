// tailwind.config.ts ou .js
/** @type {import('tailwindcss').Config} */
module.exports = { // Ou export default se for .ts e você preferir
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Se você usar a pasta pages
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Para o App Router
  ],
  theme: {
    extend: {
      // ... suas extensões de tema ...
    },
  },
  plugins: [],
};