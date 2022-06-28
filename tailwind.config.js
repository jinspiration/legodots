const { legoColors } = require("./config");

/** @type {import('tailwindcss').Config} */

const fillLegoColors = Object.keys(legoColors).map((c) => "fill-" + c);
console.log(fillLegoColors);
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ...legoColors,
      },
    },
  },
  safelist: [...fillLegoColors],
  plugins: [],
};
