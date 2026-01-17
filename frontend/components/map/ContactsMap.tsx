"use client";

import { useMemo, useCallback, useState } from "react";
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { getDegreeColor, getInitials } from "@/lib/utils";

const libraries: ("places")[] = ["places"];

interface MapNode {
  id: string;
  name: string;
  tags: string[];
  isUser: boolean;
  degree: number;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface ContactsMapProps {
  nodes: MapNode[];
  onNodeClick?: (node: MapNode) => void;
  selectedNodeId?: string | null;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a24" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a24" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8888a0" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b0b0c0" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2a3a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1a24" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3a3a4a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0d0d14" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a4a5a" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];

export function ContactsMap({ nodes, onNodeClick, selectedNodeId }: ContactsMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapNode | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Filter nodes that have valid coordinates
  const nodesWithLocation = useMemo(
    () => nodes.filter((n) => n.latitude != null && n.longitude != null),
    [nodes]
  );

  const nodesWithoutLocation = useMemo(
    () => nodes.filter((n) => n.latitude == null || n.longitude == null),
    [nodes]
  );

  // Calculate map center based on nodes
  const center = useMemo(() => {
    if (nodesWithLocation.length === 0) return defaultCenter;
    
    const lats = nodesWithLocation.map((n) => n.latitude!);
    const lngs = nodesWithLocation.map((n) => n.longitude!);
    
    return {
      lat: lats.reduce((a, b) => a + b, 0) / lats.length,
      lng: lngs.reduce((a, b) => a + b, 0) / lngs.length,
    };
  }, [nodesWithLocation]);

  const handleMarkerClick = useCallback((node: MapNode) => {
    setSelectedMarker(node);
    onNodeClick?.(node);
  }, [onNodeClick]);

  const mapOptions = useMemo(
    () => ({
      styles: darkMapStyles,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    }),
    []
  );

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-surface">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-text-muted"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Google Maps API Key Required
            </h2>
            <p className="text-text-secondary text-sm">
              Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables
              to enable the map view.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-surface">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-muted text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={5}
        options={mapOptions}
      >
        {nodesWithLocation.map((node) => (
          <MarkerF
            key={node.id}
            position={{ lat: node.latitude!, lng: node.longitude! }}
            onClick={() => handleMarkerClick(node)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: getDegreeColor(node.degree),
              fillOpacity: 1,
              strokeColor: selectedNodeId === node.id ? "#ffffff" : getDegreeColor(node.degree),
              strokeWeight: selectedNodeId === node.id ? 3 : 1,
              scale: node.isUser ? 14 : node.degree === 1 ? 10 : 8,
            }}
          />
        ))}

        {selectedMarker && (
          <InfoWindowF
            position={{ lat: selectedMarker.latitude!, lng: selectedMarker.longitude! }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2 min-w-[150px]">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-background"
                  style={{ backgroundColor: getDegreeColor(selectedMarker.degree) }}
                >
                  {getInitials(selectedMarker.name)}
                </div>
                <span className="font-medium text-gray-900">{selectedMarker.name}</span>
              </div>
              {selectedMarker.city && (
                <p className="text-xs text-gray-600">{selectedMarker.city}</p>
              )}
              {selectedMarker.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMarker.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Sidebar showing contacts without location */}
      {nodesWithoutLocation.length > 0 && (
        <div className="absolute top-4 right-4 w-64 max-h-80 bg-surface-elevated/95 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-text-primary">
              No Location Set ({nodesWithoutLocation.length})
            </h3>
          </div>
          <div className="overflow-y-auto max-h-60">
            {nodesWithoutLocation.map((node) => (
              <button
                key={node.id}
                onClick={() => onNodeClick?.(node)}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-surface transition-colors text-left"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-background"
                  style={{ backgroundColor: getDegreeColor(node.degree) }}
                >
                  {getInitials(node.name)}
                </div>
                <span className="text-sm text-text-primary truncate">{node.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
