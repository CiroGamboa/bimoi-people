"use client";

import { cn } from "@/lib/utils";

export type ViewMode = "graph" | "map";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-surface border border-border rounded-lg p-1">
      <button
        onClick={() => onChange("graph")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          value === "graph"
            ? "bg-accent-primary text-background"
            : "text-text-secondary hover:text-text-primary"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="18" r="3" />
          <line x1="8.5" y1="7.5" x2="15.5" y2="16.5" />
          <line x1="8.5" y1="16.5" x2="15.5" y2="7.5" />
        </svg>
        Graph
      </button>
      <button
        onClick={() => onChange("map")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          value === "map"
            ? "bg-accent-primary text-background"
            : "text-text-secondary hover:text-text-primary"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Map
      </button>
    </div>
  );
}
