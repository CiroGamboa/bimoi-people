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
        
        // Bimoi Brand Colors (from logo)
        bimoi: {
          magenta: "#B41F66",
          orange: "#DF5738",
          gold: "#FFB714",
          purple: "#78307D",
        },
        
        // Trust level gradient (1-5) - using Bimoi palette
        trust: {
          1: "#64748b", // Slate - low trust
          2: "#78307D", // Purple
          3: "#B41F66", // Magenta
          4: "#DF5738", // Orange
          5: "#FFB714", // Gold - highest trust
        },
        
        // Accent colors - Bimoi branded
        accent: {
          primary: "#B41F66",   // Bimoi magenta
          secondary: "#78307D", // Bimoi purple
          gold: "#FFB714",      // Bimoi gold
          orange: "#DF5738",    // Bimoi orange
        },
        
        // Degree colors for nodes
        degree: {
          0: "#FFB714", // User - gold (you're the center!)
          1: "#B41F66", // First degree - magenta
          2: "#78307D", // Second degree - purple
        }
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
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
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(180, 31, 102, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(180, 31, 102, 0.5)" },
        },
      },
      boxShadow: {
        'bimoi': '0px 8px 15px rgba(180, 31, 102, 0.2)',
        'bimoi-hover': '0px 15px 20px rgba(180, 31, 102, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'glass': '25px',
      },
    },
  },
  plugins: [],
};

export default config;
