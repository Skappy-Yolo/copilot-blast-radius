import type { GraphNode, GraphEdge, GraphState } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// graphTransformer.ts
// Converts raw tenant data (nodes/edges arrays) into a D3-ready graph state.
// Designed to be swappable with a live Graph API response in Phase 2.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a clean copy of nodes and edges ready for D3 simulation.
 * D3 mutates node objects in-place (adding x, y, vx, vy), so we deep-copy
 * to avoid polluting the source data between renders.
 */
export function transformToD3GraphState(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphState {
  const nodeCopies: GraphNode[] = nodes.map((n) => ({ ...n }));

  // Resolve edge source/target to node ID strings (safe for D3 forceSimulation)
  const edgeCopies: GraphEdge[] = edges.map((e) => ({
    ...e,
    source: typeof e.source === 'string' ? e.source : (e.source as GraphNode).id,
    target: typeof e.target === 'string' ? e.target : (e.target as GraphNode).id,
  }));

  return { nodes: nodeCopies, edges: edgeCopies };
}

/**
 * Given a user node ID and the full graph, performs a breadth-first traversal
 * to find all nodes reachable from that user (via group memberships, permissions,
 * nested groups, and inherited access).
 *
 * Returns:
 * - reachableNodeIds: Set of node IDs the user can reach
 * - reachableEdges: The edges traversed to reach those nodes
 * - stats: Counts for the StatsBar
 */
export function computeBlastRadius(
  userId: string,
  nodes: GraphNode[],
  edges: GraphEdge[]
): {
  reachableNodeIds: Set<string>;
  reachableEdges: GraphEdge[];
  stats: {
    totalFilesAccessible: number;
    sensitiveFilesExposed: number;
    eeeUSites: number;
    anomalyEdgesCount: number;
  };
} {
  const nodeMap = new Map<string, GraphNode>(nodes.map((n) => [n.id, n]));

  // Build adjacency list: nodeId → outgoing edges
  const adjacency = new Map<string, GraphEdge[]>();
  for (const edge of edges) {
    const srcId = typeof edge.source === 'string' ? edge.source : (edge.source as GraphNode).id;
    if (!adjacency.has(srcId)) adjacency.set(srcId, []);
    adjacency.get(srcId)!.push(edge);
  }

  const visited = new Set<string>([userId]);
  const reachableEdges: GraphEdge[] = [];
  const queue: string[] = [userId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const outEdges = adjacency.get(current) ?? [];

    for (const edge of outEdges) {
      const targetId = typeof edge.target === 'string' ? edge.target : (edge.target as GraphNode).id;
      reachableEdges.push(edge);
      if (!visited.has(targetId)) {
        visited.add(targetId);
        queue.push(targetId);
      }
    }
  }

  // Compute stats
  let totalFilesAccessible = 0;
  let sensitiveFilesExposed = 0;
  let eeeUSites = 0;

  for (const id of visited) {
    const node = nodeMap.get(id);
    if (!node) continue;

    if (node.type === 'document' || node.type === 'library') {
      totalFilesAccessible++;
      if (
        node.sensitivityLabel === 'Confidential' ||
        node.sensitivityLabel === 'Highly Confidential'
      ) {
        sensitiveFilesExposed++;
      }
    }

    if ((node.type === 'site' || node.type === 'library') && node.hasEEEU) {
      eeeUSites++;
    }
  }

  const anomalyEdgesCount = reachableEdges.filter((e) => e.isAnomaly).length;

  return {
    reachableNodeIds: visited,
    reachableEdges,
    stats: {
      totalFilesAccessible,
      sensitiveFilesExposed,
      eeeUSites,
      anomalyEdgesCount,
    },
  };
}

/**
 * Returns all nodes with EEEU (Everyone except external users) permissions
 * in the full graph — used for the global stats bar.
 */
export function countEEEUNodes(nodes: GraphNode[]): number {
  return nodes.filter((n) => n.hasEEEU).length;
}

/**
 * Returns total document count across the entire tenant graph.
 */
export function countTotalDocuments(nodes: GraphNode[]): number {
  return nodes.filter((n) => n.type === 'document' || n.type === 'library').length;
}
