export interface GraphNode {
  id: string;
  type: 'user' | 'group' | 'site' | 'library' | 'document';
  label: string;
  department?: string;
  role?: string;
  sensitivityLabel?: 'None' | 'Internal' | 'Confidential' | 'Highly Confidential';
  hasEEEU?: boolean; // "Everyone except external users"
  // D3 simulation fields (added at runtime)
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'memberOf' | 'permission' | 'nested_group' | 'inherited';
  permissionLevel?: 'read' | 'write' | 'fullControl';
  isAnomaly?: boolean;
}

export interface Anomaly {
  id: string;
  severity: 'Critical' | 'High' | 'Medium';
  title: string;
  description: string;
  path: string[]; // Node IDs showing the permission chain
  recommendation: string;
  microsoftTool: string;
}

export interface Role {
  id: string;
  label: string; // Dutch label for Flemish gov context
  labelEn: string; // English translation for clarity
  userId: string; // Maps to a GraphNode of type 'user'
}

export interface TenantData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  roles: Role[];
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface BlastResult {
  reachableNodeIds: Set<string>;
  reachableEdges: GraphEdge[];
  anomalies: Anomaly[];
  stats: {
    totalFilesAccessible: number;
    anomalyCount: number;
    sensitiveFilesExposed: number;
    eeeUSites: number;
    riskScore: number;
  };
}
