/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        foodloop: {
          canvas: "#F8FAFC",
          surface: "#FFFFFF",
          surfaceHover: "#F1F5F9",
          border: "#E2E8F0",
          borderStrong: "#CBD5E1",
          navy: "#0F1E36",
          navyMuted: "#334155",
          textMuted: "#64748B",
          green: "#15803D",
          greenHover: "#166534",
          greenLight: "#F0FDF4",
          greenBorder: "#BBF7D0",
          orange: "#EA580C",
          orangeHover: "#C2410C",
          orangeLight: "#FFF7ED",
          orangeBorder: "#FED7AA",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
