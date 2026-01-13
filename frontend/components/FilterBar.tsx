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
    <div className="bg-surface-elevated border border-border rounded-xl">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-muted"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="text-sm font-medium text-text-primary">
            Filter by Tags
          </span>
          {selectedTags.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-mono bg-accent-primary text-background rounded-full">
              {selectedTags.length}
            </span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            "text-text-muted transition-transform",
            isExpanded && "rotate-180"
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          {selectedTags.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted">
                Showing nodes matching any selected tag
              </span>
              <button
                onClick={clearFilters}
                className="text-xs text-accent-primary hover:text-accent-primary/80 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {availableTags.length === 0 ? (
            <p className="text-sm text-text-muted py-2">
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
                      "px-3 py-1.5 text-sm rounded-lg border transition-all",
                      isSelected
                        ? "bg-accent-primary text-background border-accent-primary"
                        : "bg-surface text-text-secondary border-border hover:border-text-muted hover:text-text-primary"
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
