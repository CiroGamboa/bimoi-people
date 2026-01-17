"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { NetworkGraph } from "@/components/graph";
import { ContactsMap } from "@/components/map";
import { PersonPanel, PersonForm, ConnectionForm } from "@/components/people";
import { FilterBar } from "@/components/FilterBar";
import { Header } from "@/components/Header";
import { Legend } from "@/components/Legend";
import { ViewMode } from "@/components/ViewToggle";
import { GET_GRAPH, GET_PERSON } from "@/lib/graphql/queries";

interface GraphNode {
  id: string;
  name: string;
  tags: string[];
  isUser: boolean;
  degree: number;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  trustLevel: number;
  context?: string;
}

export default function Home() {
  // State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isConnectionFormOpen, setIsConnectionFormOpen] = useState(false);
  const [connectionFormMode, setConnectionFormMode] = useState<"create" | "edit">("create");
  const [viewMode, setViewMode] = useState<ViewMode>("graph");

  // Persist view mode preference
  useEffect(() => {
    const saved = localStorage.getItem("bimoi-view-mode");
    if (saved === "graph" || saved === "map") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("bimoi-view-mode", mode);
  }, []);

  // Queries
  const { data: graphData, loading: graphLoading } = useQuery(GET_GRAPH, {
    variables: { depth: 2 },
  });

  const { data: personData } = useQuery(GET_PERSON, {
    variables: { id: selectedNodeId },
    skip: !selectedNodeId,
  });

  // Extract available tags from all nodes
  const availableTags = useMemo(() => {
    if (!graphData?.graph?.nodes) return [];
    const tags = new Set<string>();
    graphData.graph.nodes.forEach((node: GraphNode) => {
      node.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [graphData]);

  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNodeId(node.id);
    setSelectedEdge(null);
  }, []);

  // Handle edge click
  const handleEdgeClick = useCallback((edge: GraphEdge) => {
    setSelectedEdge(edge);
    setConnectionFormMode("edit");
    setIsConnectionFormOpen(true);
  }, []);

  // Close panel
  const handleClosePanel = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdge(null);
  }, []);

  // Open connection form for creating new connection
  const handleCreateConnection = useCallback(() => {
    if (!selectedNodeId || personData?.person?.isUser) return;
    setConnectionFormMode("create");
    setIsConnectionFormOpen(true);
  }, [selectedNodeId, personData]);

  // Handle edit connection from panel
  const handleEditConnection = useCallback(() => {
    // This would need to fetch the connection data
    // For now, we'll use the edge click handler
    setConnectionFormMode("edit");
    setIsConnectionFormOpen(true);
  }, []);

  const nodes = graphData?.graph?.nodes || [];
  const edges = graphData?.graph?.edges || [];

  // Find connection info if viewing a first-degree connection
  const selectedConnection = useMemo(() => {
    if (!selectedNodeId || !edges.length) return undefined;
    const userNode = nodes.find((n: GraphNode) => n.isUser);
    if (!userNode) return undefined;
    
    const edge = edges.find(
      (e: GraphEdge) =>
        (e.source === userNode.id && e.target === selectedNodeId) ||
        (e.target === userNode.id && e.source === selectedNodeId)
    );
    
    if (!edge) return undefined;
    
    return {
      relationshipId: edge.id,
      trustLevel: edge.trustLevel,
      context: edge.context,
    };
  }, [selectedNodeId, nodes, edges]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header 
        onAddPerson={() => setIsAddPersonOpen(true)} 
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-border p-5 space-y-5 overflow-y-auto bg-surface/30">
          <FilterBar
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
          <Legend />
          
          {/* Stats */}
          <div className="card-bimoi p-5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
              Network Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm font-medium">Total People</span>
                <span className="font-mono text-text-primary bg-surface px-2 py-1 rounded-lg">
                  {nodes.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm font-medium">Connections</span>
                <span className="font-mono text-text-primary bg-surface px-2 py-1 rounded-lg">
                  {edges.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm font-medium">1st Degree</span>
                <span 
                  className="font-mono px-2 py-1 rounded-lg"
                  style={{ 
                    color: '#B41F66',
                    backgroundColor: 'rgba(180, 31, 102, 0.1)'
                  }}
                >
                  {nodes.filter((n: GraphNode) => n.degree === 1).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm font-medium">2nd Degree</span>
                <span 
                  className="font-mono px-2 py-1 rounded-lg"
                  style={{ 
                    color: '#78307D',
                    backgroundColor: 'rgba(120, 48, 125, 0.1)'
                  }}
                >
                  {nodes.filter((n: GraphNode) => n.degree === 2).length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Graph Area */}
        <main className="flex-1 relative">
          {graphLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-3 border-bimoi-magenta border-t-transparent rounded-full animate-spin mx-auto" 
                     style={{ borderWidth: '3px' }} />
                <p className="text-text-muted text-sm font-medium">Loading your network...</p>
              </div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 max-w-md px-6">
                {/* Bimoi Logo */}
                <div className="w-24 h-24 mx-auto glow-bimoi rounded-full flex items-center justify-center bg-surface-elevated border border-border">
                  <img src="/bimoi-logo.svg" alt="Bimoi" className="w-16 h-16" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-bimoi-gradient mb-2">
                    Welcome to Bimoi
                  </h2>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Your personal social graph is empty. Start by adding yourself, 
                    then add the people you know and map the connections between them.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsAddPersonOpen(true)}
                  className="btn-bimoi inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Your First Person
                </button>
              </div>
            </div>
          ) : viewMode === "graph" ? (
            <NetworkGraph
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              selectedNodeId={selectedNodeId}
              highlightedTags={selectedTags}
            />
          ) : (
            <ContactsMap
              nodes={nodes}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNodeId}
            />
          )}

          {/* Quick actions floating button for connecting */}
          {selectedNodeId && personData?.person && !personData.person.isUser && !selectedConnection && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
              <button
                onClick={handleCreateConnection}
                className="btn-bimoi flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Connect with {personData.person.name}
              </button>
            </div>
          )}
        </main>

        {/* Person Panel */}
        {selectedNodeId && personData?.person && (
          <aside className="w-96">
            <PersonPanel
              person={{ ...personData.person, degree: nodes.find((n: GraphNode) => n.id === selectedNodeId)?.degree }}
              connection={selectedConnection}
              onClose={handleClosePanel}
              onEditConnection={handleEditConnection}
            />
          </aside>
        )}
      </div>

      {/* Modals */}
      <PersonForm
        isOpen={isAddPersonOpen}
        onClose={() => setIsAddPersonOpen(false)}
      />

      <ConnectionForm
        isOpen={isConnectionFormOpen}
        onClose={() => setIsConnectionFormOpen(false)}
        mode={connectionFormMode}
        targetPersonId={connectionFormMode === "create" ? selectedNodeId || undefined : undefined}
        targetPersonName={connectionFormMode === "create" ? personData?.person?.name : undefined}
        existingConnection={
          connectionFormMode === "edit" && selectedEdge
            ? {
                relationshipId: selectedEdge.id,
                trustLevel: selectedEdge.trustLevel,
                context: selectedEdge.context,
              }
            : selectedConnection
        }
      />
    </div>
  );
}
