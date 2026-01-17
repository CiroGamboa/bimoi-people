"use client";

import { getDegreeColor, getInitials, getTrustColor } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
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

  // Pre-compute FIXED positions, then unfix for interaction
  const graphData = useMemo(() => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const minDim = Math.min(dimensions.width, dimensions.height);

    const firstDegree = nodes.filter(n => n.degree === 1);
    const secondDegree = nodes.filter(n => n.degree === 2);

    const radius1 = minDim * 0.25;
    const radius2 = minDim * 0.42;

    const positionedNodes = nodes.map((n) => {
      let x = centerX;
      let y = centerY;

      if (n.isUser) {
        x = centerX;
        y = centerY;
      } else if (n.degree === 1) {
        const idx = firstDegree.indexOf(n);
        const angle = (2 * Math.PI * idx) / firstDegree.length - Math.PI / 2;
        x = centerX + radius1 * Math.cos(angle);
        y = centerY + radius1 * Math.sin(angle);
      } else {
        const idx = secondDegree.indexOf(n);
        const angle = (2 * Math.PI * idx) / secondDegree.length - Math.PI / 2;
        x = centerX + radius2 * Math.cos(angle);
        y = centerY + radius2 * Math.sin(angle);
      }

      // Start FIXED, will unfix after mount for dragging
      return { ...n, x, y, fx: x, fy: y };
    });

    return {
      nodes: positionedNodes,
      links: edges.map((e) => ({
        ...e,
        source: e.source,
        target: e.target,
      })),
    };
  }, [nodes, edges, dimensions]);

  // Disable forces - layout is fixed
  useEffect(() => {
    if (!graphRef.current || nodes.length === 0) return;

    const fg = graphRef.current;

    // Disable all simulation forces
    fg.d3Force('charge', null);
    fg.d3Force('link', null);
    fg.d3Force('center', null);

    // Zoom to fit after render
    setTimeout(() => {
      fg.zoomToFit(300, 50);
    }, 100);

  }, [nodes.length]);

  // Zoom to fit after initial render
  useEffect(() => {
    if (!graphRef.current || nodes.length === 0) return;

    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(400, 80);
    }, 500);

    return () => clearTimeout(timer);
  }, [nodes.length]);

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
      if (!isFinite(node.x) || !isFinite(node.y)) return;

      const label = getInitials(node.name);
      const size = node.isUser ? 30 : node.degree === 1 ? 22 : 16;
      const fontSize = Math.max(size / 2, 10);
      const isSelected = node.id === selectedNodeId;
      const highlighted = isHighlighted(node);

      // Glow effect for user node
      if (node.isUser) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 15, 0, 2 * Math.PI);
        const gradient = ctx.createRadialGradient(node.x, node.y, size, node.x, node.y, size + 20);
        gradient.addColorStop(0, "rgba(230, 184, 61, 0.5)");
        gradient.addColorStop(1, "rgba(230, 184, 61, 0)");
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);

      const baseColor = getDegreeColor(node.degree);
      ctx.fillStyle = highlighted ? baseColor : `${baseColor}50`;
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
      ctx.fillStyle = highlighted ? "#0a0a0f" : "#0a0a0f90";
      ctx.fillText(label, node.x, node.y);

      // Name label below node
      if (globalScale > 0.3) {
        const nameSize = Math.min(13, Math.max(10, 12 / globalScale));
        ctx.font = `500 ${nameSize}px system-ui, sans-serif`;

        ctx.shadowColor = "rgba(0, 0, 0, 1)";
        ctx.shadowBlur = 8;
        ctx.fillStyle = highlighted ? "#f0f0f5" : "#f0f0f570";
        ctx.fillText(node.name, node.x, node.y + size + 14);
        ctx.shadowBlur = 0;
      }
    },
    [selectedNodeId, isHighlighted]
  );

  // Custom link rendering
  const linkCanvasObject = useCallback(
    (link: any, ctx: CanvasRenderingContext2D) => {
      const start = link.source;
      const end = link.target;

      if (!isFinite(start.x) || !isFinite(start.y) || !isFinite(end.x) || !isFinite(end.y)) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);

      // Curved line
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const curvature = 0.15;
      const cpX = midX - dy * curvature;
      const cpY = midY + dx * curvature;

      ctx.quadraticCurveTo(cpX, cpY, end.x, end.y);

      const trustColor = getTrustColor(link.trustLevel);
      ctx.strokeStyle = `${trustColor}50`;
      ctx.lineWidth = 1.5 + link.trustLevel * 0.3;
      ctx.stroke();
    },
    []
  );

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
          const edge = edges.find((e) => e.id === link.id);
          if (edge) onEdgeClick?.(edge);
        }}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          if (!isFinite(node.x) || !isFinite(node.y)) return;
          const size = node.isUser ? 30 : node.degree === 1 ? 22 : 16;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 8, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        linkPointerAreaPaint={(link: any, color, ctx) => {
          const start = link.source;
          const end = link.target;
          if (!isFinite(start?.x) || !isFinite(end?.x)) return;

          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = color;
          ctx.lineWidth = 15;
          ctx.stroke();
        }}
        backgroundColor="transparent"
        d3VelocityDecay={0.5}
        d3AlphaDecay={0.08}
        warmupTicks={30}
        cooldownTicks={50}
        cooldownTime={1000}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
        onEngineStop={() => {
          graphRef.current?.zoomToFit(300, 40);
        }}
        minZoom={0.3}
        maxZoom={6}
      />
    </div>
  );
}
