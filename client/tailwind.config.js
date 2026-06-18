module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0f0f1e",
        "bg-secondary": "#1a1a2e",
        "bg-tertiary": "#16213e",
        "text-primary": "#eaeaea",
        "text-secondary": "#b0b0b0",
        "accent-primary": "#00d4ff",
        "accent-secondary": "#ff006e",
      },
    },
  },
  plugins: [],
};
