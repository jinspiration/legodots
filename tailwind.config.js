const { BOARDCOLORS, DOTCOLORS } = require("./src/meta");

/** @type {import('tailwindcss').Config} */

const fillLegoColors = Object.keys(DOTCOLORS).map((c) => "fill-" + c);
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ...BOARDCOLORS,
        ...DOTCOLORS,
      },
    },
  },
  safelist: [...fillLegoColors],
  plugins: [],
};
