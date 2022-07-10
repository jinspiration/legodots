/** @type {import('tailwindcss').Config} */

const { BOARDCOLORS, DOTCOLORS } = require("./src/meta.json");

const fillLegoColors = [
  ...Object.keys(DOTCOLORS),
  ...Object.keys(BOARDCOLORS),
].map((c) => "fill-" + c);
const bgLegoColors = [
  ...Object.keys(DOTCOLORS),
  ...Object.keys(BOARDCOLORS),
].map((c) => "bg-" + c);

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        "real-hover": { raw: "(hover: hover)" },
      },
      colors: {
        ...BOARDCOLORS,
        ...DOTCOLORS,
      },
    },
  },
  safelist: [...fillLegoColors, ...bgLegoColors],
  plugins: [require("daisyui")],
};
