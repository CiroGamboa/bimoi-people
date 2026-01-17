"use client";

import { cn } from "@/lib/utils";
import { useState, KeyboardEvent } from "react";

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  label,
  value,
  onChange,
  placeholder = "Add tag...",
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = inputValue.trim().toLowerCase();
      if (tag && !value.includes(tag)) {
        onChange([...value, tag]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 p-3 bg-surface border-2 border-border rounded-xl min-h-[52px] focus-within:border-bimoi-magenta focus-within:ring-4 focus-within:ring-bimoi-magenta/10 transition-all duration-300">
        {value.map((tag) => (
          <span
            key={tag}
            className="tag-bimoi group cursor-pointer hover:bg-bimoi-magenta/20"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-bimoi-magenta/70 hover:text-bimoi-magenta transition-colors"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-sm font-[Poppins]"
        />
      </div>
      <p className="text-xs text-text-muted font-medium">Press Enter to add a tag</p>
    </div>
  );
}
