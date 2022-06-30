const { COLORS } = require("./src/meta");

/** @type {import('tailwindcss').Config} */

const fillLegoColors = Object.keys(COLORS).map((c) => "fill-" + c);
console.log(fillLegoColors);
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ...COLORS,
      },
    },
  },
  safelist: [...fillLegoColors],
  plugins: [],
};
