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

export function getTrustColor(level: number): string {
  const colors = {
    1: "#64748b",
    2: "#6b7280",
    3: "#78716c",
    4: "#d97706",
    5: "#f59e0b",
  };
  return colors[level as keyof typeof colors] || colors[3];
}

export function getDegreeColor(degree: number): string {
  const colors = {
    0: "#e64d3d", // User
    1: "#e6b83d", // First degree
    2: "#3d8be6", // Second degree
  };
  return colors[degree as keyof typeof colors] || colors[2];
}
