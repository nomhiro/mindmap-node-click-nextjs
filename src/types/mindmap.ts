export interface MindmapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  level: number;
  parentId?: string;
  children: string[];
  details?: NodeDetails;
}

export interface NodeDetails {
  title: string;
  description: string;
  content: string[];
  metadata?: Record<string, any>;
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
}

export interface MindmapData {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  rootId: string;
}

export interface MindmapStore {
  mindmapData: MindmapData | null;
  selectedNodeId: string | null;
  mermaidInput: string;
  setMindmapData: (data: MindmapData) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setMermaidInput: (input: string) => void;
  parseMermaidToMindmap: (mermaidText: string) => void;
  parseMermaidForNodeData: (mermaidText: string) => void;
}