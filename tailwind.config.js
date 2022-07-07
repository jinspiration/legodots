const { BOARDCOLORS, DOTCOLORS } = require("./src/meta");

/** @type {import('tailwindcss').Config} */

const fillLegoColors = [
  ...Object.keys(DOTCOLORS),
  ...Object.keys(BOARDCOLORS),
].map((c) => "fill-" + c);
const bgLegoColors = [
  ...Object.keys(DOTCOLORS),
  ...Object.keys(BOARDCOLORS),
].map((c) => "bg-" + c);
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
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
  daisyui: {
    // themes: ["retro", "dark"],
  },
};
