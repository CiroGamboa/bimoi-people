"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function FilterBar({
  availableTags,
  selectedTags,
  onTagsChange,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onTagsChange([]);
  };

  // Group tags by category (simple heuristic)
  const sortedTags = [...availableTags].sort();

  return (
    <div className="card-bimoi overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-bimoi-magenta/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-bimoi-magenta"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            Filter by Tags
          </span>
          {selectedTags.length > 0 && (
            <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-bimoi-magenta to-bimoi-orange text-white rounded-full shadow-bimoi">
              {selectedTags.length}
            </span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            "text-text-muted transition-transform duration-300",
            isExpanded && "rotate-180"
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border pt-4 animate-fade-in">
          {selectedTags.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-text-muted font-medium">
                Showing nodes matching any selected tag
              </span>
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-bimoi-magenta hover:text-bimoi-orange transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {availableTags.length === 0 ? (
            <p className="text-sm text-text-muted py-3">
              No tags available. Add tags to people to enable filtering.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sortedTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-full border-2 transition-all duration-300 font-medium",
                      isSelected
                        ? "bg-gradient-to-r from-bimoi-magenta to-bimoi-orange text-white border-transparent shadow-bimoi"
                        : "bg-surface text-text-secondary border-border hover:border-bimoi-magenta/50 hover:text-text-primary"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
