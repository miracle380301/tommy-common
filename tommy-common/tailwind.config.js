/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './packages/**/frontend/**/*.{js,jsx,ts,tsx}',
    './packages/**/src/**/*.{js,jsx,ts,tsx}',
    './packages/**/stories/**/*.{js,jsx,ts,tsx}',
    './stories/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
