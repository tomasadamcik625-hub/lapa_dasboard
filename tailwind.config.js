/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mjs}",
    "./components/**/*.{js,ts,jsx,tsx,mjs}",
    "./app/**/*.{js,ts,jsx,tsx,mjs}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lapa: {
          blue: "#7DC8E8",
          blueDark: "#4FA8CE",
          blueLight: "#B8E2F5",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#7DC8E8",
              foreground: "#ffffff",
              100: "#E8F6FC",
              200: "#C8EAFA",
              300: "#A3DAF5",
              400: "#7DC8E8",
              500: "#4FA8CE",
              600: "#3A8DB3",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#7DC8E8",
              foreground: "#ffffff",
              100: "#0A2030",
              200: "#0F3347",
              300: "#1A4D6B",
              400: "#7DC8E8",
              500: "#A3DAF5",
              600: "#C8EAFA",
            },
          },
        },
      },
    }),
  ],
};