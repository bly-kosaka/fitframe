import type { Config } from "tailwindcss";

// デザイントークン（仕様書 §8 準拠）
const config: Config = {
  content: [
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#2f54ff",
          hover: "#2645e0",
          weak: "#eef1ff",
          weak2: "#e0e6ff",
        },
        text: {
          DEFAULT: "#15181e",
          2: "#586173",
          3: "#8b93a3",
        },
        canvas: {
          DEFAULT: "#f5f6f9",
          2: "#eef0f5",
        },
        surface: {
          DEFAULT: "#ffffff",
          2: "#f7f8fb",
        },
        border: {
          DEFAULT: "#e6e9f0",
          strong: "#d6dae3",
          input: "#cfd4df",
        },
        ok: {
          DEFAULT: "#16a37b",
          weak: "#e6f6ef",
        },
        warn: {
          DEFAULT: "#d98a09",
          weak: "#fdf3e2",
        },
        danger: {
          DEFAULT: "#e0463e",
          weak: "#fdecec",
        },
      },
      borderRadius: {
        xs: "5px",
        sm: "7px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      fontFamily: {
        display: ["var(--font-outfit)", '"Noto Sans JP"', "system-ui", "sans-serif"],
        jp: ['"Noto Sans JP"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        xs: "0 1px 2px rgba(20, 27, 45, 0.06)",
        sm: "0 1px 3px rgba(20, 27, 45, 0.08), 0 1px 2px rgba(20, 27, 45, 0.04)",
        md: "0 4px 14px rgba(20, 27, 45, 0.08), 0 2px 5px rgba(20, 27, 45, 0.05)",
        lg: "0 18px 48px rgba(20, 27, 45, 0.14), 0 6px 16px rgba(20, 27, 45, 0.08)",
      },
      keyframes: {
        "screen-fade": {
          from: { transform: "translateY(7px)" },
          to: { transform: "none" },
        },
        fadein: {
          from: { transform: "translateY(4px)" },
          to: { transform: "none" },
        },
      },
      animation: {
        "screen-fade": "screen-fade .3s cubic-bezier(.2,.7,.3,1) both",
        fadein: "fadein .35s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
