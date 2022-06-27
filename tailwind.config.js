/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "lego-blue": "#0067B1",
        "lego-blue-light": "#019BD7",
        "lego-green": "#01A227",
        "lego-yellow": "#FEB400",
        "lego-yellow-light": "#FAE862",
        "lego-red-light": "#FF5569",
        "lego-purple": "#CFB7DD",
        "lego-white": "#F3F1EF",
      },
    },
  },
  plugins: [],
};
