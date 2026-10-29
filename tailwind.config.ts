import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#ecfdf3", 100: "#d1fadf", 500: "#12b76a", 600: "#039855", 700: "#027a48" },
      },
    },
  },
  plugins: [],
};

export default config;
