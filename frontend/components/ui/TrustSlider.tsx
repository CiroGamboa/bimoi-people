"use client";

import { cn } from "@/lib/utils";
import { getTrustColor } from "@/lib/utils";

interface TrustSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const trustLabels = ["Low", "Casual", "Good", "Strong", "Deep"];

export function TrustSlider({ value, onChange, className }: TrustSliderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-text-secondary">
          Trust Level
        </label>
        <span
          className="text-sm font-mono font-medium px-2 py-0.5 rounded"
          style={{ color: getTrustColor(value), backgroundColor: `${getTrustColor(value)}20` }}
        >
          {value}/5 - {trustLabels[value - 1]}
        </span>
      </div>
      
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              "flex-1 h-10 rounded-lg transition-all duration-200 border-2",
              level <= value
                ? "border-transparent"
                : "border-border hover:border-text-muted"
            )}
            style={{
              backgroundColor: level <= value ? getTrustColor(level) : "transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
}
