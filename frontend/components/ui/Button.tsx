"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed",
          {
            // Primary - Bimoi gradient button
            "bg-gradient-to-r from-bimoi-magenta to-bimoi-orange text-white shadow-bimoi hover:shadow-bimoi-hover hover:-translate-y-0.5":
              variant === "primary",
            // Secondary - Surface with border
            "bg-surface-elevated text-text-primary border border-border hover:bg-surface hover:border-bimoi-magenta/50 focus:ring-border":
              variant === "secondary",
            // Ghost - Transparent
            "text-text-secondary hover:text-text-primary hover:bg-surface-elevated focus:ring-border":
              variant === "ghost",
            // Danger - Red
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 hover:-translate-y-0.5 shadow-lg hover:shadow-xl":
              variant === "danger",
            // Gold - Bimoi accent
            "bg-bimoi-gold text-background font-semibold hover:bg-bimoi-gold/90 hover:-translate-y-0.5 shadow-lg hover:shadow-xl":
              variant === "gold",
            // Outline - Magenta outline
            "bg-transparent border-2 border-bimoi-magenta text-bimoi-magenta hover:bg-bimoi-magenta hover:text-white hover:-translate-y-0.5":
              variant === "outline",
          },
          {
            "text-sm px-4 py-2": size === "sm",
            "text-sm px-5 py-2.5": size === "md",
            "text-base px-8 py-3.5": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
