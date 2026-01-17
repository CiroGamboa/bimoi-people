"use client";

import { useRef, useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { cn } from "@/lib/utils";

const libraries: ("places")[] = ["places"];

interface CityAutocompleteProps {
  value: string;
  onChange: (location: {
    city: string;
    latitude: number;
    longitude: number;
  } | null) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function CityAutocomplete({
  value,
  onChange,
  placeholder = "Search for a city...",
  className,
  label,
}: CityAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["(cities)"],
        fields: ["formatted_address", "geometry", "name"],
      }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (place?.geometry?.location) {
        const city = place.formatted_address || place.name || "";
        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();
        
        setInputValue(city);
        onChange({ city, latitude, longitude });
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange]);

  const handleClear = () => {
    setInputValue("");
    onChange(null);
  };

  if (loadError) {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="px-3 py-2 bg-surface border border-border rounded-lg text-text-muted text-sm">
          Maps API unavailable. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable.
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isLoaded ? placeholder : "Loading..."}
          disabled={!isLoaded}
          className={cn(
            "w-full px-3 py-2 pr-10 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary",
            "transition-all duration-200",
            !isLoaded && "opacity-50"
          )}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
