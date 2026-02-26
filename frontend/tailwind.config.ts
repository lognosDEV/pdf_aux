import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Helvetica Neue Light"',
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif"
        ]
      }
    }
  }
};

export default config;
