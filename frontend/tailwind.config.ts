import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme base
        background: "#0a0a0f",
        surface: "#12121a",
        "surface-elevated": "#1a1a24",
        border: "#2a2a3a",
        
        // Text
        "text-primary": "#f0f0f5",
        "text-secondary": "#8888a0",
        "text-muted": "#55556a",
        
        // Trust level gradient (1-5)
        trust: {
          1: "#64748b", // Slate
          2: "#6b7280", // Gray
          3: "#78716c", // Stone  
          4: "#d97706", // Amber
          5: "#f59e0b", // Amber bright
        },
        
        // Accent colors
        accent: {
          primary: "#e6b83d",
          secondary: "#3d8be6",
          user: "#e64d3d",
        },
        
        // Degree colors for nodes
        degree: {
          0: "#e64d3d", // User - warm red
          1: "#e6b83d", // First degree - gold
          2: "#3d8be6", // Second degree - blue
        }
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
