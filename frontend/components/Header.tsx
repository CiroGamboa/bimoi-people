"use client";

import { Button } from "@/components/ui";

interface HeaderProps {
  onAddPerson: () => void;
}

export function Header({ onAddPerson }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
          <span className="text-background font-bold text-sm">B</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Bimoi</h1>
          <p className="text-xs text-text-muted">Personal Social Graph</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onAddPerson} size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mr-1.5"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Add Person
        </Button>
      </div>
    </header>
  );
}
