import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Bimoi Brand Colors
const BIMOI_COLORS = {
  magenta: "#B41F66",
  orange: "#DF5738",
  gold: "#FFB714",
  purple: "#78307D",
};

export function getTrustColor(level: number): string {
  // Trust levels using Bimoi palette - from cool to warm
  const colors = {
    1: "#64748b",           // Slate - low trust
    2: BIMOI_COLORS.purple, // Purple
    3: BIMOI_COLORS.magenta, // Magenta
    4: BIMOI_COLORS.orange,  // Orange
    5: BIMOI_COLORS.gold,    // Gold - highest trust
  };
  return colors[level as keyof typeof colors] || colors[3];
}

export function getDegreeColor(degree: number): string {
  // Degree colors using Bimoi palette
  const colors = {
    0: BIMOI_COLORS.gold,    // User - Gold (you're special!)
    1: BIMOI_COLORS.magenta, // First degree - Magenta
    2: BIMOI_COLORS.purple,  // Second degree - Purple
  };
  return colors[degree as keyof typeof colors] || colors[2];
}

export function getTrustLabel(level: number): string {
  const labels = {
    1: "Low",
    2: "Casual",
    3: "Good",
    4: "Strong",
    5: "Deep",
  };
  return labels[level as keyof typeof labels] || "Unknown";
}
