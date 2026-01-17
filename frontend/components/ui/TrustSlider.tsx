"use client";

import { cn } from "@/lib/utils";
import { getTrustColor, getTrustLabel } from "@/lib/utils";

interface TrustSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function TrustSlider({ value, onChange, className }: TrustSliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-text-secondary">
          Trust Level
        </label>
        <span
          className="text-sm font-semibold px-3 py-1 rounded-full transition-all duration-300"
          style={{ 
            color: getTrustColor(value), 
            backgroundColor: `${getTrustColor(value)}20`,
            boxShadow: `0 0 10px ${getTrustColor(value)}30`
          }}
        >
          {value}/5 · {getTrustLabel(value)}
        </span>
      </div>
      
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              "flex-1 h-12 rounded-xl transition-all duration-300 border-2 relative overflow-hidden",
              level <= value
                ? "border-transparent scale-100"
                : "border-border hover:border-text-muted scale-95 hover:scale-100"
            )}
            style={{
              backgroundColor: level <= value ? getTrustColor(level) : "transparent",
              boxShadow: level <= value ? `0 4px 15px ${getTrustColor(level)}40` : "none",
            }}
          >
            {level <= value && (
              <span className="absolute inset-0 bg-white/10 animate-pulse" />
            )}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-text-muted font-medium">
        <span>Low</span>
        <span>Deep</span>
      </div>
    </div>
  );
}
