"use client";

import { getDegreeColor, getTrustColor, getTrustLabel } from "@/lib/utils";

export function Legend() {
  return (
    <div className="card-bimoi p-4 space-y-5">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
        Legend
      </h3>

      {/* Node degrees */}
      <div className="space-y-3">
        <span className="text-xs text-text-secondary font-medium">Connection Degree</span>
        <div className="space-y-2">
          {[
            { degree: 0, label: "You" },
            { degree: 1, label: "1st degree (direct)" },
            { degree: 2, label: "2nd degree (friend of friend)" },
          ].map(({ degree, label }) => (
            <div key={degree} className="flex items-center gap-3 group">
              <div
                className="w-5 h-5 rounded-full transition-all duration-300 group-hover:scale-110"
                style={{ 
                  backgroundColor: getDegreeColor(degree),
                  boxShadow: `0 0 10px ${getDegreeColor(degree)}40`
                }}
              />
              <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust levels */}
      <div className="space-y-3">
        <span className="text-xs text-text-secondary font-medium">Trust Level</span>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className="flex-1 h-3 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
              style={{ 
                backgroundColor: getTrustColor(level),
                boxShadow: `0 2px 8px ${getTrustColor(level)}30`
              }}
              title={`${level}/5 - ${getTrustLabel(level)}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-muted font-medium">
          <span>Low</span>
          <span>Deep</span>
        </div>
      </div>
    </div>
  );
}
