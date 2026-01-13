"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { NetworkGraph } from "@/components/graph";
import { PersonPanel, PersonForm, ConnectionForm } from "@/components/people";
import { FilterBar } from "@/components/FilterBar";
import { Header } from "@/components/Header";
import { Legend } from "@/components/Legend";
import { GET_GRAPH, GET_PERSON } from "@/lib/graphql/queries";

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

export default function Home() {
  // State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isConnectionFormOpen, setIsConnectionFormOpen] = useState(false);
  const [connectionFormMode, setConnectionFormMode] = useState<"create" | "edit">("create");

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
      <Header onAddPerson={() => setIsAddPersonOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-border p-4 space-y-4 overflow-y-auto">
          <FilterBar
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
          <Legend />
          
          {/* Stats */}
          <div className="bg-surface-elevated border border-border rounded-xl p-4">
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">
              Network Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total People</span>
                <span className="font-mono text-text-primary">{nodes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Connections</span>
                <span className="font-mono text-text-primary">{edges.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">1st Degree</span>
                <span className="font-mono text-text-primary">
                  {nodes.filter((n: GraphNode) => n.degree === 1).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">2nd Degree</span>
                <span className="font-mono text-text-primary">
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
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-text-muted text-sm">Loading graph...</p>
              </div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md">
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-1">
                    Your graph is empty
                  </h2>
                  <p className="text-text-secondary text-sm">
                    Start by adding yourself, then add the people you know and
                    the connections between them.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddPersonOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-background rounded-lg font-medium hover:bg-accent-primary/90 transition-colors"
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
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Your First Person
                </button>
              </div>
            </div>
          ) : (
            <NetworkGraph
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              selectedNodeId={selectedNodeId}
              highlightedTags={selectedTags}
            />
          )}

          {/* Quick actions floating button for connecting */}
          {selectedNodeId && personData?.person && !personData.person.isUser && !selectedConnection && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
              <button
                onClick={handleCreateConnection}
                className="flex items-center gap-2 px-4 py-2 bg-accent-secondary text-white rounded-full shadow-lg hover:bg-accent-secondary/90 transition-colors"
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
          <aside className="w-80">
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
