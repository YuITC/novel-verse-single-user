"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { aiApi } from "../../api/aiApi";
import type { GraphNode, GraphEdge, Character, NovelOption } from "../../types";
import { RELATIONSHIP_COLORS } from "../../types";
import { NovelSelector } from "../shared/NovelSelector";
import { KnowledgeSlider } from "../shared/KnowledgeSlider";

// ============================================================================
// Force-Directed Layout
// ============================================================================

function computeForceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  iterations = 100,
): GraphNode[] {
  if (nodes.length === 0) return [];

  const positioned = nodes.map((n, i) => ({
    ...n,
    x: width / 2 + (Math.cos((i / nodes.length) * Math.PI * 2) * width) / 3,
    y: height / 2 + (Math.sin((i / nodes.length) * Math.PI * 2) * height) / 3,
  }));

  const protagonistIdx = positioned.findIndex((n) => n.role === "protagonist");
  const centerX = width / 2;
  const centerY = height / 2;

  const nodeMap = new Map<string, number>();
  positioned.forEach((n, i) => nodeMap.set(n.id, i));

  for (let iter = 0; iter < iterations; iter++) {
    const temperature = 1 - iter / iterations;
    const forceScale = 2.0 * temperature;

    const fx = new Float64Array(positioned.length);
    const fy = new Float64Array(positioned.length);

    // Repulsion between all node pairs
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const dx = positioned[i].x! - positioned[j].x!;
        const dy = positioned[i].y! - positioned[j].y!;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const repulsion = 8000 / (dist * dist);
        const rx = (dx / dist) * repulsion;
        const ry = (dy / dist) * repulsion;
        fx[i] += rx;
        fy[i] += ry;
        fx[j] -= rx;
        fy[j] -= ry;
      }
    }

    // Spring attraction along edges
    for (const edge of edges) {
      const si = nodeMap.get(edge.source_id);
      const ti = nodeMap.get(edge.target_id);
      if (si === undefined || ti === undefined) continue;
      const dx = positioned[ti].x! - positioned[si].x!;
      const dy = positioned[ti].y! - positioned[si].y!;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const idealLen = 160;
      const spring = 0.03 * (dist - idealLen);
      const sx = (dx / dist) * spring;
      const sy = (dy / dist) * spring;
      fx[si] += sx;
      fy[si] += sy;
      fx[ti] -= sx;
      fy[ti] -= sy;
    }

    // Protagonist attracted to center
    if (protagonistIdx >= 0) {
      const dx = centerX - positioned[protagonistIdx].x!;
      const dy = centerY - positioned[protagonistIdx].y!;
      fx[protagonistIdx] += dx * 0.05;
      fy[protagonistIdx] += dy * 0.05;
    }

    // Gentle gravity toward center for all
    for (let i = 0; i < positioned.length; i++) {
      fx[i] += (centerX - positioned[i].x!) * 0.002;
      fy[i] += (centerY - positioned[i].y!) * 0.002;
    }

    // Apply forces
    for (let i = 0; i < positioned.length; i++) {
      const maxMove = 20 * forceScale;
      const moveX = Math.max(-maxMove, Math.min(maxMove, fx[i] * forceScale));
      const moveY = Math.max(-maxMove, Math.min(maxMove, fy[i] * forceScale));
      positioned[i].x = positioned[i].x! + moveX;
      positioned[i].y = positioned[i].y! + moveY;
    }
  }

  return positioned;
}

// ============================================================================
// Helpers
// ============================================================================

function getNodeSize(role: string): { w: number; cls: string; border: string } {
  switch (role) {
    case "protagonist":
      return { w: 64, cls: "w-16 h-16", border: "border-4" };
    case "antagonist":
      return { w: 56, cls: "w-14 h-14", border: "border-2" };
    case "supporting":
      return { w: 48, cls: "w-12 h-12", border: "border-2" };
    default:
      return { w: 40, cls: "w-10 h-10", border: "border-2" };
  }
}

function getEdgeStyle(type: string): {
  stroke: string;
  dashArray?: string;
  width: number;
} {
  switch (type) {
    case "ally":
      return { stroke: "#10b981", width: 2 };
    case "enemy":
      return { stroke: "#ef4444", dashArray: "6,4", width: 2 };
    case "romantic":
      return { stroke: "#f472b6", width: 2 };
    case "master_disciple":
      return { stroke: "#3b82f6", dashArray: "2,4", width: 2 };
    case "acquaintance":
    default:
      return { stroke: "#cbd5e1", width: 1.5 };
  }
}

function quadraticBezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { path: string; mx: number; my: number } {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.min(dist * 0.15, 40);
  const nx = -dy / (dist || 1);
  const ny = dx / (dist || 1);
  const cx = midX + nx * offset;
  const cy = midY + ny * offset;
  const mx = (x1 + 2 * cx + x2) / 4;
  const my = (y1 + 2 * cy + y2) / 4;
  return {
    path: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
    mx,
    my,
  };
}

// ============================================================================
// Component
// ============================================================================

export function RelationshipGraphPage() {
  // ---- State ----
  const [selectedNovelId, setSelectedNovelId] = useState("");
  const [totalChapters, setTotalChapters] = useState(1);
  const [maxChapter, setMaxChapter] = useState(1);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );

  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffset = useRef({ x: 0, y: 0 });

  // ---- Data Fetching ----
  useEffect(() => {
    if (!selectedNovelId || maxChapter < 1) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [n, e] = await Promise.all([
          aiApi.getGraphNodes(selectedNovelId, maxChapter),
          aiApi.getGraphEdges(selectedNovelId, maxChapter),
        ]);
        if (cancelled) return;
        const laid = computeForceLayout(n, e, 900, 700);
        setNodes(laid);
        setEdges(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedNovelId, maxChapter]);

  // Fetch selected character detail
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!selectedNode) {
        setSelectedCharacter(null);
        return;
      }
      try {
        const chars = await aiApi.getCharacters(selectedNovelId);
        const found = chars.find((c) => c.id === selectedNode);
        setSelectedCharacter(found || null);
      } catch {
        setSelectedCharacter(null);
      }
    };
    fetchCharacter();
  }, [selectedNode, selectedNovelId]);

  // ---- Novel selection handler ----
  const handleNovelChange = useCallback(
    (novelId: string, novel: NovelOption) => {
      setSelectedNovelId(novelId);
      setTotalChapters(novel.total_chapters || 1);
      setMaxChapter(novel.total_chapters || 1);
      setSelectedNode(null);
      setPan({ x: 0, y: 0 });
      setZoom(1);
    },
    [],
  );

  // ---- Canvas mouse interactions ----
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panOffset.current = { ...pan };
    },
    [pan],
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({ x: panOffset.current.x + dx, y: panOffset.current.y + dy });
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(0.3, Math.min(3.0, z + delta)));
  }, []);

  // ---- Zoom controls ----
  const zoomIn = useCallback(() => setZoom((z) => Math.min(3.0, z + 0.2)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.3, z - 0.2)), []);
  const fitScreen = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // ---- Filtered nodes ----
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const q = searchQuery.toLowerCase();
    return nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        (n.faction && n.faction.toLowerCase().includes(q)),
    );
  }, [nodes, searchQuery]);

  const highlightedNodeIds = useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes],
  );

  // ---- Hovered node connections ----
  const hoveredConnections = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const ids = new Set<string>();
    for (const e of edges) {
      if (e.source_id === hoveredNode || e.target_id === hoveredNode) {
        ids.add(e.id);
      }
    }
    return ids;
  }, [hoveredNode, edges]);

  // ---- Selected node data ----
  const selectedNodeData = useMemo(
    () => nodes.find((n) => n.id === selectedNode) || null,
    [nodes, selectedNode],
  );

  const selectedNodeEdges = useMemo(() => {
    if (!selectedNode) return [];
    return edges.filter(
      (e) => e.source_id === selectedNode || e.target_id === selectedNode,
    );
  }, [edges, selectedNode]);

  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const ids = new Set<string>();
    for (const e of selectedNodeEdges) {
      if (e.source_id !== selectedNode) ids.add(e.source_id);
      if (e.target_id !== selectedNode) ids.add(e.target_id);
    }
    return nodes.filter((n) => ids.has(n.id));
  }, [selectedNode, selectedNodeEdges, nodes]);

  // ---- Node map for edge rendering ----
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white animate-in fade-in duration-500 max-w-[1300px] mx-auto border-x border-slate-100">
      {/* ================================================================== */}
      {/* LEFT SIDEBAR                                                       */}
      {/* ================================================================== */}
      <aside className="hidden lg:flex flex-col w-80 border-r border-slate-100 bg-white shrink-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <span className="material-symbols-outlined text-xl text-blue-500">
                  hub
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Interactive Graph
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-[42px]">
              Explore character connections and faction dynamics
            </p>
          </div>

          {/* Novel Selector */}
          <NovelSelector
            value={selectedNovelId}
            onChange={handleNovelChange}
            label="Source Material"
          />

          {/* Timeline Range */}
          <KnowledgeSlider
            value={maxChapter}
            max={totalChapters}
            onChange={setMaxChapter}
            label="Timeline Range"
            description="Limit relationships shown up to this chapter"
          />

          {/* Search */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Find Character / Faction
            </label>
            <div className="relative">
              <span className="material-symbols-outlined text-lg text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="text"
                placeholder="Search by name or faction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          {/* Legend */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-3 block">
              Relationship Legend
            </label>
            <div className="space-y-2.5">
              {Object.entries(RELATIONSHIP_COLORS).map(([key, val]) => {
                const style = getEdgeStyle(key);
                return (
                  <div key={key} className="flex items-center gap-3">
                    <svg width="32" height="8" className="shrink-0">
                      <line
                        x1="0"
                        y1="4"
                        x2="32"
                        y2="4"
                        stroke={style.stroke}
                        strokeWidth={style.width}
                        strokeDasharray={style.dashArray}
                      />
                    </svg>
                    <span className={`text-xs font-medium ${val.text}`}>
                      {val.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          {nodes.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Characters</span>
                <span className="font-bold text-slate-700">{nodes.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Connections</span>
                <span className="font-bold text-slate-700">{edges.length}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ================================================================== */}
      {/* MAIN CANVAS                                                        */}
      {/* ================================================================== */}
      <main className="flex-1 relative overflow-hidden">
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="absolute inset-0 bg-slate-50/50 cursor-grab active:cursor-grabbing select-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            opacity: 1,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Dot-grid opacity overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              opacity: 0.03,
            }}
          />

          {/* Transformed container */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            {/* SVG Edges */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ overflow: "visible" }}
            >
              {edges.map((edge) => {
                const source = nodeMap.get(edge.source_id);
                const target = nodeMap.get(edge.target_id);
                if (!source || !target || source.x == null || target.x == null)
                  return null;

                const style = getEdgeStyle(edge.relationship_type);
                const isHighlighted = hoveredConnections.has(edge.id);
                const isDimmed =
                  hoveredNode !== null && !hoveredConnections.has(edge.id);
                const { path, mx, my } = quadraticBezierPath(
                  source.x!,
                  source.y!,
                  target.x!,
                  target.y!,
                );

                return (
                  <g
                    key={edge.id}
                    style={{
                      opacity: isDimmed ? 0.15 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <path
                      d={path}
                      fill="none"
                      stroke={style.stroke}
                      strokeWidth={
                        isHighlighted ? style.width + 1 : style.width
                      }
                      strokeDasharray={style.dashArray}
                    />
                    {/* Edge label */}
                    <text
                      x={mx}
                      y={my - 6}
                      textAnchor="middle"
                      fontSize={10}
                      fill={style.stroke}
                      fontWeight={500}
                      className="select-none"
                      style={{ pointerEvents: "none" }}
                    >
                      {edge.label}
                    </text>
                    {/* Arrow for directional edges */}
                    {edge.direction === "a_to_b" && (
                      <circle
                        cx={target.x!}
                        cy={target.y!}
                        r={4}
                        fill={style.stroke}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const { w, cls, border } = getNodeSize(node.role);
              const isSelected = selectedNode === node.id;
              const isSearchMatch = searchQuery.trim()
                ? highlightedNodeIds.has(node.id)
                : true;
              const isDimmedByHover =
                hoveredNode !== null &&
                hoveredNode !== node.id &&
                !edges.some(
                  (e) =>
                    (e.source_id === hoveredNode && e.target_id === node.id) ||
                    (e.target_id === hoveredNode && e.source_id === node.id),
                );

              // Determine border color from primary relationship or faction color
              const relEdge = edges.find(
                (e) => e.source_id === node.id || e.target_id === node.id,
              );
              const relColor = relEdge
                ? RELATIONSHIP_COLORS[relEdge.relationship_type]?.stroke ||
                  "#94a3b8"
                : "#94a3b8";

              return (
                <div
                  key={node.id}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: (node.x || 0) - w / 2,
                    top: (node.y || 0) - w / 2,
                    opacity: isDimmedByHover ? 0.25 : isSearchMatch ? 1 : 0.2,
                    transition: "opacity 0.2s, transform 0.15s",
                    transform: isSelected ? "scale(1.1)" : "scale(1)",
                    zIndex: isSelected ? 20 : hoveredNode === node.id ? 15 : 10,
                  }}
                >
                  {/* Protagonist glow ring */}
                  {node.role === "protagonist" && (
                    <div
                      className="absolute rounded-full bg-primary/20 blur-xl animate-pulse"
                      style={{
                        width: w + 24,
                        height: w + 24,
                        left: -12,
                        top: -12,
                      }}
                    />
                  )}

                  {/* Node circle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(
                        node.id === selectedNode ? null : node.id,
                      );
                    }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`${cls} ${border} rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer relative z-10 shadow-md hover:shadow-lg transition-shadow`}
                    style={{
                      borderColor:
                        node.role === "protagonist"
                          ? "var(--color-primary, #6366f1)"
                          : relColor,
                      backgroundColor:
                        node.role === "protagonist"
                          ? "var(--color-primary, #6366f1)"
                          : relColor,
                    }}
                    title={node.name}
                  >
                    {node.initials}
                  </button>

                  {/* Name label */}
                  <span
                    className="mt-1 text-[10px] font-medium text-slate-700 bg-white/90 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap max-w-[80px] truncate text-center"
                    style={{ pointerEvents: "none" }}
                  >
                    {node.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-30">
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-primary animate-spin">
                  progress_activity
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  Building graph...
                </span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && nodes.length === 0 && selectedNovelId && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">
                  hub
                </span>
                <p className="text-sm text-slate-500 font-medium">
                  No character relationships found
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting the timeline range or selecting a different
                  novel
                </p>
              </div>
            </div>
          )}

          {/* No novel selected */}
          {!loading && !selectedNovelId && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">
                  menu_book
                </span>
                <p className="text-sm text-slate-500 font-medium">
                  Select a novel to begin
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-1.5 z-20">
          <button
            onClick={zoomIn}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            title="Zoom in"
          >
            <span className="material-symbols-outlined text-lg text-slate-600">
              zoom_in
            </span>
          </button>
          <button
            onClick={zoomOut}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            title="Zoom out"
          >
            <span className="material-symbols-outlined text-lg text-slate-600">
              zoom_out
            </span>
          </button>
          <button
            onClick={fitScreen}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            title="Fit to screen"
          >
            <span className="material-symbols-outlined text-lg text-slate-600">
              fit_screen
            </span>
          </button>
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-6 left-[72px] bg-white/80 border border-slate-200 rounded-lg px-2.5 py-1.5 z-20">
          <span className="text-xs font-medium text-slate-500">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </main>

      {/* ================================================================== */}
      {/* RIGHT DETAIL PANEL                                                 */}
      {/* ================================================================== */}
      {/* Overlay backdrop for smaller screens */}
      {selectedNode && (
        <div
          className="fixed inset-0 bg-black/20 z-30 xl:hidden"
          onClick={() => setSelectedNode(null)}
        />
      )}

      <aside
        className={`
          fixed xl:relative right-0 top-0 h-full w-80 bg-white border-l border-slate-100 z-40
          transform transition-transform duration-300 ease-out overflow-y-auto
          ${selectedNode ? "translate-x-0" : "translate-x-full"}
          xl:shrink-0
        `}
      >
        {selectedNodeData && (
          <div className="p-6 space-y-6">
            {/* Close button */}
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-lg text-slate-400">
                close
              </span>
            </button>

            {/* Avatar + Name */}
            <div className="flex flex-col items-center text-center pt-2">
              {/* Avatar circle */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg mb-3"
                style={{
                  backgroundColor:
                    selectedNodeData.role === "protagonist"
                      ? "var(--color-primary, #6366f1)"
                      : (() => {
                          const relEdge = edges.find(
                            (e) =>
                              e.source_id === selectedNodeData.id ||
                              e.target_id === selectedNodeData.id,
                          );
                          return relEdge
                            ? RELATIONSHIP_COLORS[relEdge.relationship_type]
                                ?.stroke || "#94a3b8"
                            : "#94a3b8";
                        })(),
                }}
              >
                {selectedNodeData.initials}
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                {selectedNodeData.name}
              </h2>

              {/* Role badge */}
              <span className="mt-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                {selectedNodeData.role}
              </span>

              {/* Faction badge */}
              {selectedNodeData.faction && (
                <span className="mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                  <span className="material-symbols-outlined text-xs mr-1 align-middle">
                    diversity_3
                  </span>
                  {selectedNodeData.faction}
                </span>
              )}
            </div>

            {/* Profile Summary */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-slate-400">
                  description
                </span>
                Profile Summary
              </h3>
              {selectedCharacter?.biography ? (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedCharacter.biography}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                  No biography available yet.
                </p>
              )}
            </div>

            {/* Traits */}
            {selectedCharacter?.personality_traits &&
              selectedCharacter.personality_traits.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-slate-400">
                      psychology
                    </span>
                    Personality Traits
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCharacter.personality_traits.map((trait, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* First appearance */}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-sm text-slate-400">
                visibility
              </span>
              First appeared in Chapter{" "}
              {selectedNodeData.first_appearance_chapter}
            </div>

            {/* Known Connections */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-slate-400">
                  link
                </span>
                Known Connections
                <span className="text-xs font-normal text-slate-400">
                  ({connectedNodes.length})
                </span>
              </h3>

              {connectedNodes.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No connections found.
                </p>
              ) : (
                <div className="space-y-2">
                  {connectedNodes.map((cn) => {
                    const edge = selectedNodeEdges.find(
                      (e) =>
                        (e.source_id === cn.id &&
                          e.target_id === selectedNode) ||
                        (e.target_id === cn.id && e.source_id === selectedNode),
                    );
                    const relType = edge?.relationship_type || "acquaintance";
                    const relConfig = RELATIONSHIP_COLORS[relType];

                    return (
                      <button
                        key={cn.id}
                        onClick={() => setSelectedNode(cn.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/80 transition-all text-left"
                      >
                        {/* Mini avatar */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{
                            backgroundColor: relConfig?.stroke || "#94a3b8",
                          }}
                        >
                          {cn.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-700 truncate">
                            {cn.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{
                                backgroundColor: relConfig?.stroke || "#94a3b8",
                              }}
                            />
                            <span
                              className={`text-[10px] font-medium ${relConfig?.text || "text-slate-500"}`}
                            >
                              {edge?.label || relType}
                            </span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-sm text-slate-300">
                          chevron_right
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
