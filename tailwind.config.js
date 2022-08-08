/** @type {import('tailwindcss').Config} */

const { COLORS } = require("./src/meta.json");

const legoColors = Object.fromEntries(
  Object.entries({ ...COLORS }).map(([key, value]) => ["lego-" + key, value])
);
const safelist = [
  ...Object.keys(legoColors).map((k) => "fill-" + k),
  ...Object.keys(legoColors).map((k) => "bg-" + k),
];

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    height: (theme) => ({
      auto: "auto",
      ...theme("spacing"),
      full: "100%",
      screen: "calc(var(--vh) * 100)",
    }),
    extend: {
      screens: {
        "real-hover": { raw: "(hover: hover)" },
      },
      colors: {
        ...legoColors,
      },
    },
  },
  safelist,
  // plugins: [require("daisyui")],
};
