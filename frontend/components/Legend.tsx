"use client";

import { getDegreeColor, getTrustColor } from "@/lib/utils";

export function Legend() {
  return (
    <div className="bg-surface-elevated/80 backdrop-blur-sm border border-border rounded-xl p-4 space-y-4">
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide">
        Legend
      </h3>

      {/* Node degrees */}
      <div className="space-y-2">
        <span className="text-xs text-text-secondary">Connection Degree</span>
        <div className="space-y-1.5">
          {[
            { degree: 0, label: "You" },
            { degree: 1, label: "1st degree (direct)" },
            { degree: 2, label: "2nd degree (friend of friend)" },
          ].map(({ degree, label }) => (
            <div key={degree} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getDegreeColor(degree) }}
              />
              <span className="text-xs text-text-secondary">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust levels */}
      <div className="space-y-2">
        <span className="text-xs text-text-secondary">Trust Level</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className="flex-1 h-2 rounded"
              style={{ backgroundColor: getTrustColor(level) }}
              title={`Trust level ${level}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-muted">
          <span>Low</span>
          <span>Deep</span>
        </div>
      </div>
    </div>
  );
}
