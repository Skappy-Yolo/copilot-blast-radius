import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphEdge } from '../types';

interface BlastGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedUserId: string | null;
  reachableNodeIds: Set<string>;
  reachableEdges: GraphEdge[];
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

// Node color by type (matches PROJECT_SPEC.md spec)
const NODE_COLORS: Record<GraphNode['type'], string> = {
  user: '#60CDFF',
  group: '#60E0A0',
  site: '#FFB340',
  library: '#E0E0E0',
  document: '#FFFFFF',
};

const NODE_RADIUS: Record<GraphNode['type'], number> = {
  user: 10,
  group: 8,
  site: 9,
  library: 7,
  document: 5,
};

const ANOMALY_COLOR = '#F03030';
const DIM_OPACITY = 0.12;
const ACTIVE_OPACITY = 1.0;

export default function BlastGraph({
  nodes,
  edges,
  selectedUserId,
  reachableNodeIds,
  reachableEdges,
  isAnimating,
  onAnimationComplete,
}: BlastGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Build/rebuild the D3 force simulation whenever nodes or edges change ────
  useEffect(() => {
    const svg = d3.select(svgRef.current!);
    const container = containerRef.current!;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    svg.selectAll('*').remove();

    // Arrow marker for directed edges
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -4 8 8')
      .attr('refX', 14)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#555');

    const g = svg.append('g').attr('class', 'graph-root');

    // Zoom + pan
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Deep copy nodes to avoid D3 mutation carrying over between renders
    const simNodes: GraphNode[] = nodes.map((n) => ({ ...n }));
    const nodeById = new Map<string, GraphNode>(simNodes.map((n) => [n.id, n]));

    // Resolve edge references to node objects (D3 requirement for forceLink)
    const simEdges: GraphEdge[] = edges.map((e) => ({
      ...e,
      source: nodeById.get(typeof e.source === 'string' ? e.source : (e.source as GraphNode).id) ?? e.source,
      target: nodeById.get(typeof e.target === 'string' ? e.target : (e.target as GraphNode).id) ?? e.target,
    }));

    // Simulation
    const simulation = d3
      .forceSimulation<GraphNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(simEdges)
          .id((d) => d.id)
          .distance((e) => {
            const src = e.source as GraphNode;
            const tgt = e.target as GraphNode;
            if (src.type === 'user' && tgt.type === 'group') return 80;
            if (tgt.type === 'document') return 50;
            return 110;
          })
          .strength(0.4)
      )
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius((d) => NODE_RADIUS[d.type] + 6));

    simulationRef.current = simulation;

    // ── Edges ────────────────────────────────────────────────────────────────
    const edgeSelection = g
      .append('g')
      .attr('class', 'edges')
      .selectAll<SVGLineElement, GraphEdge>('line')
      .data(simEdges)
      .join('line')
      .attr('class', 'edge')
      .attr('stroke', (d) => (d.isAnomaly ? ANOMALY_COLOR : '#334155'))
      .attr('stroke-width', (d) => (d.isAnomaly ? 1.5 : 1))
      .attr('stroke-opacity', 0.5)
      .attr('marker-end', 'url(#arrowhead)');

    // ── Nodes ────────────────────────────────────────────────────────────────
    const nodeGroup = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(simNodes)
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    nodeGroup
      .append('circle')
      .attr('r', (d) => NODE_RADIUS[d.type])
      .attr('fill', (d) => NODE_COLORS[d.type])
      .attr('stroke', (d) => (d.hasEEEU ? ANOMALY_COLOR : 'transparent'))
      .attr('stroke-width', 2)
      .attr('opacity', 0.9);

    // Labels (only for users and sites to avoid clutter)
    nodeGroup
      .filter((d) => d.type === 'user' || d.type === 'site')
      .append('text')
      .text((d) => {
        if (d.type === 'user') {
          const parts = d.label.split(' ');
          return parts.length > 1 ? `${parts[0][0]}. ${parts[parts.length - 1]}` : d.label;
        }
        return d.label.length > 18 ? d.label.slice(0, 16) + '…' : d.label;
      })
      .attr('x', (d) => NODE_RADIUS[d.type] + 4)
      .attr('y', 4)
      .attr('font-size', '9px')
      .attr('fill', '#CBD5E1')
      .attr('pointer-events', 'none');

    // Tooltip on hover
    nodeGroup
      .append('title')
      .text((d) => `${d.label}\n${d.type.toUpperCase()}${d.role ? '\n' + d.role : ''}${d.sensitivityLabel ? '\nLabel: ' + d.sensitivityLabel : ''}${d.hasEEEU ? '\n⚠ EEEU permission' : ''}`);

    // Tick
    simulation.on('tick', () => {
      edgeSelection
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);

      nodeGroup.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges]);

  // ── Blast animation when selectedUserId changes ───────────────────────────
  const runBlastAnimation = useCallback(() => {
    if (!selectedUserId || !svgRef.current) {
      onAnimationComplete();
      return;
    }

    const svg = d3.select(svgRef.current);
    const reachableEdgeSet = new Set(
      reachableEdges.map(
        (e) =>
          `${typeof e.source === 'string' ? e.source : (e.source as GraphNode).id}→${typeof e.target === 'string' ? e.target : (e.target as GraphNode).id}`
      )
    );

    // Phase 1: Dim everything
    svg
      .selectAll<SVGGElement, GraphNode>('.node circle')
      .transition()
      .duration(300)
      .attr('opacity', (d) => (reachableNodeIds.has(d.id) ? 0.9 : DIM_OPACITY));

    svg
      .selectAll<SVGLineElement, GraphEdge>('.edge')
      .transition()
      .duration(300)
      .attr('stroke-opacity', (d) => {
        const srcId = typeof d.source === 'string' ? d.source : (d.source as GraphNode).id;
        const tgtId = typeof d.target === 'string' ? d.target : (d.target as GraphNode).id;
        return reachableEdgeSet.has(`${srcId}→${tgtId}`) ? 0.8 : 0.05;
      });

    // Phase 2: Highlight selected user
    svg
      .selectAll<SVGGElement, GraphNode>('.node circle')
      .filter((d) => d.id === selectedUserId)
      .transition()
      .duration(300)
      .attr('r', 14)
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2)
      .attr('opacity', ACTIVE_OPACITY);

    // Phase 3: Animate blast edges in waves (0ms, 500ms, 1000ms)
    // Wave 1: direct group memberships (user → group)
    // Wave 2: group → site/library
    // Wave 3: inherited/nested
    const waves = [
      reachableEdges.filter((e) => {
        const srcId = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id;
        return srcId === selectedUserId;
      }),
      reachableEdges.filter((e) => {
        const src = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id;
        return src.startsWith('group-') && (e.type === 'permission' || e.type === 'nested_group');
      }),
      reachableEdges.filter((e) => e.type === 'inherited'),
    ];

    let delay = 400;
    for (const wave of waves) {
      const waveKeys = new Set(
        wave.map(
          (e) =>
            `${typeof e.source === 'string' ? e.source : (e.source as GraphNode).id}→${typeof e.target === 'string' ? e.target : (e.target as GraphNode).id}`
        )
      );

      svg
        .selectAll<SVGLineElement, GraphEdge>('.edge')
        .filter((d) => {
          const srcId = typeof d.source === 'string' ? d.source : (d.source as GraphNode).id;
          const tgtId = typeof d.target === 'string' ? d.target : (d.target as GraphNode).id;
          return waveKeys.has(`${srcId}→${tgtId}`);
        })
        .transition()
        .delay(delay)
        .duration(500)
        .attr('stroke', (d) => (d.isAnomaly ? ANOMALY_COLOR : '#60CDFF'))
        .attr('stroke-opacity', 1.0)
        .attr('stroke-width', (d) => (d.isAnomaly ? 2.5 : 1.5));

      // Scale up reached nodes
      svg
        .selectAll<SVGGElement, GraphNode>('.node circle')
        .filter((d) => {
          return wave.some((e) => {
            const tgtId = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id;
            return tgtId === d.id;
          });
        })
        .transition()
        .delay(delay + 200)
        .duration(300)
        .attr('r', (d) => NODE_RADIUS[d.type] + 3)
        .attr('stroke', (d) => (d.hasEEEU ? ANOMALY_COLOR : '#60CDFF'))
        .attr('stroke-width', 2)
        .attr('opacity', ACTIVE_OPACITY);

      delay += 500;
    }

    // Gently push blast nodes outward in simulation
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }

    // Signal complete after all waves
    setTimeout(onAnimationComplete, delay + 200);
  }, [selectedUserId, reachableNodeIds, reachableEdges, onAnimationComplete]);

  useEffect(() => {
    if (isAnimating) {
      runBlastAnimation();
    }
  }, [isAnimating, runBlastAnimation]);

  // Reset styles when no role selected
  useEffect(() => {
    if (!selectedUserId && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg
        .selectAll<SVGGElement, GraphNode>('.node circle')
        .transition()
        .duration(400)
        .attr('opacity', 0.9)
        .attr('r', (d) => NODE_RADIUS[d.type])
        .attr('stroke', (d) => (d.hasEEEU ? ANOMALY_COLOR : 'transparent'))
        .attr('stroke-width', 2);

      svg
        .selectAll<SVGLineElement, GraphEdge>('.edge')
        .transition()
        .duration(400)
        .attr('stroke', (d) => (d.isAnomaly ? ANOMALY_COLOR : '#334155'))
        .attr('stroke-opacity', 0.5)
        .attr('stroke-width', (d) => (d.isAnomaly ? 1.5 : 1));
    }
  }, [selectedUserId]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#0F172A',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      />
      {/* Legend — top-left, clear of the toggle */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          background: 'rgba(15,23,42,0.88)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 11,
          color: '#94A3B8',
          minWidth: 160,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Legenda
        </span>
        {(
          [
            ['user', 'Gebruiker'],
            ['group', 'Beveiligingsgroep'],
            ['site', 'SharePoint-site'],
            ['library', 'Documentbibliotheek'],
            ['document', 'Document'],
          ] as [GraphNode['type'], string][]
        ).map(([type, label]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={14} height={14} style={{ flexShrink: 0 }}>
              <circle cx={7} cy={7} r={NODE_RADIUS[type] * 0.75} fill={NODE_COLORS[type]} />
            </svg>
            <span>{label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)', color: '#F87171' }}>
          <svg width={14} height={14} style={{ flexShrink: 0 }}>
            <circle cx={7} cy={7} r={5} fill="none" stroke={ANOMALY_COLOR} strokeWidth={2} />
          </svg>
          <span>EEEU / Anomalie</span>
        </div>
      </div>
    </div>
  );
}
