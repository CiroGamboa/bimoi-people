"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getInitials, getDegreeColor, getTrustColor } from "@/lib/utils";

// Dynamic import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-text-muted">
      Loading graph...
    </div>
  ),
});

interface GraphNode {
  id: string;
  name: string;
  tags: string[];
  isUser: boolean;
  degree: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  trustLevel: number;
  context?: string;
}

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
  selectedNodeId?: string | null;
  highlightedTags?: string[];
}

export function NetworkGraph({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  selectedNodeId,
  highlightedTags = [],
}: NetworkGraphProps) {
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Center on user node when graph loads
  useEffect(() => {
    if (graphRef.current && nodes.length > 0) {
      const userNode = nodes.find((n) => n.isUser);
      if (userNode) {
        setTimeout(() => {
          graphRef.current?.centerAt(0, 0, 500);
          graphRef.current?.zoom(1.5, 500);
        }, 500);
      }
    }
  }, [nodes]);

  // Check if a node matches highlighted tags
  const isHighlighted = useCallback(
    (node: GraphNode) => {
      if (highlightedTags.length === 0) return true;
      return node.tags.some((tag) => highlightedTags.includes(tag));
    },
    [highlightedTags]
  );

  // Custom node rendering
  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = getInitials(node.name);
      const size = node.isUser ? 24 : node.degree === 1 ? 18 : 14;
      const fontSize = Math.max(size / 2, 8);
      const isSelected = node.id === selectedNodeId;
      const highlighted = isHighlighted(node);
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
      
      // Fill with degree color
      const baseColor = getDegreeColor(node.degree);
      ctx.fillStyle = highlighted ? baseColor : `${baseColor}40`;
      ctx.fill();
      
      // Border for selected node
      if (isSelected) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      
      // Initials
      ctx.font = `bold ${fontSize}px JetBrains Mono, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = highlighted ? "#0a0a0f" : "#0a0a0f80";
      ctx.fillText(label, node.x, node.y);
      
      // Name label below node
      if (globalScale > 0.7) {
        const nameSize = Math.max(10, 12 / globalScale);
        ctx.font = `${nameSize}px Geist, system-ui, sans-serif`;
        ctx.fillStyle = highlighted ? "#f0f0f5" : "#f0f0f580";
        ctx.fillText(node.name, node.x, node.y + size + 12);
      }
    },
    [selectedNodeId, isHighlighted]
  );

  // Custom link rendering
  const linkCanvasObject = useCallback(
    (link: any, ctx: CanvasRenderingContext2D) => {
      const start = link.source;
      const end = link.target;
      
      if (!start.x || !end.x) return;
      
      // Draw curved line
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      
      // Slight curve for aesthetics
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const curvature = 0.1;
      const cpX = midX - dy * curvature;
      const cpY = midY + dx * curvature;
      
      ctx.quadraticCurveTo(cpX, cpY, end.x, end.y);
      
      // Color based on trust level
      const trustColor = getTrustColor(link.trustLevel);
      ctx.strokeStyle = `${trustColor}60`;
      ctx.lineWidth = Math.max(1, link.trustLevel / 2);
      ctx.stroke();
    },
    []
  );

  const graphData = {
    nodes: nodes.map((n) => ({ ...n })),
    links: edges.map((e) => ({
      ...e,
      source: e.source,
      target: e.target,
    })),
  };

  return (
    <div ref={containerRef} className="w-full h-full graph-container relative">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeId="id"
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={(node: any) => onNodeClick?.(node)}
        onLinkClick={(link: any) => {
          // Find the original edge data
          const edge = edges.find((e) => e.id === link.id);
          if (edge) onEdgeClick?.(edge);
        }}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          const size = node.isUser ? 24 : node.degree === 1 ? 18 : 14;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 5, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        linkPointerAreaPaint={(link: any, color, ctx) => {
          const start = link.source;
          const end = link.target;
          if (!start.x || !end.x) return;
          
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = color;
          ctx.lineWidth = 10;
          ctx.stroke();
        }}
        backgroundColor="transparent"
        d3VelocityDecay={0.3}
        d3AlphaDecay={0.02}
        warmupTicks={50}
        cooldownTicks={100}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
      />
    </div>
  );
}
