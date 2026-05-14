import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f6f3",
        ink: "#17211b",
        mutedInk: "#66736c",
        line: "#dce3dd",
        surface: "#ffffff",
        accent: "#0b8a5f",
        accentStrong: "#076a48",
        accentSoft: "#ecf6ef",
        paleBlue: "#ebf2ff",
        paleBlueInk: "#2557a6",
        paleGreen: "#e7f4ed",
        paleGreenInk: "#0f6b47",
        paleRed: "#fbe8e5",
        paleRedInk: "#964437",
        paleYellow: "#f7f0d8",
        paleYellowInk: "#8e6700"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"]
      },
      boxShadow: {
        hairline: "0 1px 2px rgba(23, 33, 27, 0.04)"
      },
      backgroundImage: {
        paper:
          "radial-gradient(circle at top left, rgba(11, 138, 95, 0.08), transparent 24%), radial-gradient(circle at bottom right, rgba(23, 33, 27, 0.04), transparent 24%)"
      }
    }
  },
  plugins: [],
};

export default config;
