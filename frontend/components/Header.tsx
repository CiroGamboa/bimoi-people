"use client";

import Image from "next/image";
import { Button } from "@/components/ui";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";

interface HeaderProps {
  onAddPerson: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function Header({ onAddPerson, viewMode, onViewModeChange }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Bimoi Logo */}
        <Image
          src="/bimoi-logo.svg"
          alt="Bimoi"
          width={40}
          height={40}
          className="w-10 h-10"
        />
        <div>
          <h1 className="text-xl font-semibold text-bimoi-gradient">
            Bimoi
          </h1>
          <p className="text-xs text-text-muted font-medium">
            Personal Social Graph
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ViewToggle value={viewMode} onChange={onViewModeChange} />
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
