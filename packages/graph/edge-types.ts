export enum EdgeType {
  HIERARCHY = 'hierarchy',
  DEPENDENCY = 'dependency',
  ALTERNATIVE = 'alternative',
  INTEGRATION = 'integration',
  EXTENSION = 'extension',
  GROUPING = 'grouping',
}

export interface EdgeStyle {
  strokeWidth: number;
  strokeDasharray?: string;
  stroke: string;
  animated?: boolean;
  markerEnd?: string;
  markerStart?: string;
}

export interface EdgeTypeConfig {
  type: EdgeType;
  label: string;
  description: string;
  style: EdgeStyle;
}

export const EDGE_TYPE_CONFIGS: Record<EdgeType, EdgeTypeConfig> = {
  [EdgeType.HIERARCHY]: {
    type: EdgeType.HIERARCHY,
    label: 'Hierarchy',
    description: 'Parent-child relationship showing structural hierarchy',
    style: {
      strokeWidth: 2,
      stroke: '#64748b',
      markerEnd: 'arrow',
    },
  },
  [EdgeType.DEPENDENCY]: {
    type: EdgeType.DEPENDENCY,
    label: 'Dependency',
    description: 'Shows that one component depends on another',
    style: {
      strokeWidth: 2,
      strokeDasharray: '5,5',
      stroke: '#3b82f6',
      markerEnd: 'arrow',
    },
  },
  [EdgeType.ALTERNATIVE]: {
    type: EdgeType.ALTERNATIVE,
    label: 'Alternative',
    description: 'Indicates alternative or optional paths',
    style: {
      strokeWidth: 2,
      strokeDasharray: '2,4',
      stroke: '#8b5cf6',
    },
  },
  [EdgeType.INTEGRATION]: {
    type: EdgeType.INTEGRATION,
    label: 'Integration',
    description: 'Bidirectional integration between components',
    style: {
      strokeWidth: 2,
      stroke: '#10b981',
      markerEnd: 'arrow',
      markerStart: 'arrow',
    },
  },
  [EdgeType.EXTENSION]: {
    type: EdgeType.EXTENSION,
    label: 'Extension',
    description: 'Shows extension or enhancement relationship',
    style: {
      strokeWidth: 3,
      stroke: '#f59e0b',
      markerEnd: 'arrow',
    },
  },
  [EdgeType.GROUPING]: {
    type: EdgeType.GROUPING,
    label: 'Grouping',
    description: 'Visual grouping of related components',
    style: {
      strokeWidth: 1,
      strokeDasharray: '8,4',
      stroke: '#94a3b8',
    },
  },
};

export function getEdgeTypeConfig(type: EdgeType): EdgeTypeConfig {
  return EDGE_TYPE_CONFIGS[type];
}

export function isValidEdgeType(type: string): type is EdgeType {
  return Object.values(EdgeType).includes(type as EdgeType);
}

export function getEdgeStyle(type: EdgeType): EdgeStyle {
  return EDGE_TYPE_CONFIGS[type].style;
}

export function getAllEdgeTypes(): EdgeType[] {
  return Object.values(EdgeType);
}
