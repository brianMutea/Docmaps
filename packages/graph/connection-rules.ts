/**
 * Connection Rules Engine
 * 
 * Defines which node types can connect via different edge types.
 * Rules are organized by edge type to maintain clarity and extensibility.
 */

import type { EdgeType } from './edge-types';

export type NodeType = 'product' | 'feature' | 'component' | 'textBlock' | 'group';

export interface ConnectionRule {
  allowed: Array<{
    source: NodeType | NodeType[];
    target: NodeType | NodeType[];
  }>;
  description: string;
}

/**
 * Connection rules organized by edge type.
 * Each edge type has its own semantic meaning and connection constraints.
 */
export const CONNECTION_RULES: Record<EdgeType, ConnectionRule> = {
  /**
   * HIERARCHY EDGES - Strict structural relationships
   * Maintains honest architectural hierarchy
   */
  hierarchy: {
    description: 'Strict parent-child structural relationships',
    allowed: [
      // Product can have child components
      { source: 'product', target: 'component' },
      
      // Components can have subcomponents
      { source: 'component', target: 'component' },
      
      // Features can have subfeatures
      { source: 'feature', target: 'feature' },
      
      // Text blocks can be hierarchically organized
      { source: 'textBlock', target: 'textBlock' },
    ],
  },

  /**
   * DEPENDENCY EDGES - Behavioral dependencies (loose, cross-type)
   * Dependencies are about behavior, not structure
   */
  dependency: {
    description: 'Behavioral dependencies across node types',
    allowed: [
      // Any node can depend on any other node
      { 
        source: ['product', 'feature', 'component', 'textBlock'], 
        target: ['product', 'feature', 'component', 'textBlock'] 
      },
    ],
  },

  /**
   * INTEGRATION EDGES - Boundary-crossing integrations
   * Explicitly designed to ignore hierarchy
   */
  integration: {
    description: 'Cross-boundary integrations (unrestricted)',
    allowed: [
      // Any node can integrate with any other node
      { 
        source: ['product', 'feature', 'component', 'textBlock', 'group'], 
        target: ['product', 'feature', 'component', 'textBlock', 'group'] 
      },
    ],
  },

  /**
   * EXTENSION EDGES - Augmentative relationships
   * Cross-level by nature (plugins, middleware, etc.)
   */
  extension: {
    description: 'Extension and augmentation relationships',
    allowed: [
      // Features can extend components
      { source: 'feature', target: 'component' },
      
      // Components can extend other components
      { source: 'component', target: 'component' },
      
      // Components can extend features
      { source: 'component', target: 'feature' },
      
      // Any node can extend products (middleware, plugins)
      { source: ['feature', 'component', 'textBlock'], target: 'product' },
    ],
  },

  /**
   * ALTERNATIVE EDGES - Optional paths (unrestricted)
   * Represents choices, not claims about structure
   */
  alternative: {
    description: 'Alternative options and paths (unrestricted)',
    allowed: [
      // Any node can be an alternative to any other node
      { 
        source: ['product', 'feature', 'component', 'textBlock', 'group'], 
        target: ['product', 'feature', 'component', 'textBlock', 'group'] 
      },
    ],
  },

  /**
   * GROUPING EDGES - Visual organization (fully unrestricted)
   * Pure layout hint, not a semantic claim
   */
  grouping: {
    description: 'Visual grouping (fully unrestricted)',
    allowed: [
      // Any node can be grouped with any other node
      { 
        source: ['product', 'feature', 'component', 'textBlock', 'group'], 
        target: ['product', 'feature', 'component', 'textBlock', 'group'] 
      },
    ],
  },
};

/**
 * Check if a connection is valid for a given edge type
 */
export function isValidConnection(
  sourceType: NodeType,
  targetType: NodeType,
  edgeType: EdgeType
): boolean {
  const rule = CONNECTION_RULES[edgeType];
  
  if (!rule) {
    return false;
  }

  return rule.allowed.some(({ source, target }) => {
    const sourceMatch = Array.isArray(source) 
      ? source.includes(sourceType) 
      : source === sourceType;
    
    const targetMatch = Array.isArray(target) 
      ? target.includes(targetType) 
      : target === targetType;
    
    return sourceMatch && targetMatch;
  });
}

/**
 * Get all valid target types for a given source type and edge type
 */
export function getValidTargetTypes(
  sourceType: NodeType,
  edgeType: EdgeType
): NodeType[] {
  const rule = CONNECTION_RULES[edgeType];
  
  if (!rule) {
    return [];
  }

  const validTargets = new Set<NodeType>();

  rule.allowed.forEach(({ source, target }) => {
    const sourceMatch = Array.isArray(source) 
      ? source.includes(sourceType) 
      : source === sourceType;
    
    if (sourceMatch) {
      if (Array.isArray(target)) {
        target.forEach(t => validTargets.add(t));
      } else {
        validTargets.add(target);
      }
    }
  });

  return Array.from(validTargets);
}

/**
 * Get all valid source types for a given target type and edge type
 */
export function getValidSourceTypes(
  targetType: NodeType,
  edgeType: EdgeType
): NodeType[] {
  const rule = CONNECTION_RULES[edgeType];
  
  if (!rule) {
    return [];
  }

  const validSources = new Set<NodeType>();

  rule.allowed.forEach(({ source, target }) => {
    const targetMatch = Array.isArray(target) 
      ? target.includes(targetType) 
      : target === targetType;
    
    if (targetMatch) {
      if (Array.isArray(source)) {
        source.forEach(s => validSources.add(s));
      } else {
        validSources.add(source);
      }
    }
  });

  return Array.from(validSources);
}

/**
 * Get a human-readable reason why a connection is invalid
 */
export function getConnectionInvalidReason(
  sourceType: NodeType,
  targetType: NodeType,
  edgeType: EdgeType
): string {
  const rule = CONNECTION_RULES[edgeType];
  
  if (!rule) {
    return `Unknown edge type: ${edgeType}`;
  }

  if (isValidConnection(sourceType, targetType, edgeType)) {
    return '';
  }

  return `${edgeType} edges cannot connect ${sourceType} to ${targetType}. ${rule.description}`;
}

/**
 * Get all edge types that allow a connection between two node types
 */
export function getValidEdgeTypes(
  sourceType: NodeType,
  targetType: NodeType
): EdgeType[] {
  const validTypes: EdgeType[] = [];

  (Object.keys(CONNECTION_RULES) as EdgeType[]).forEach(edgeType => {
    if (isValidConnection(sourceType, targetType, edgeType)) {
      validTypes.push(edgeType);
    }
  });

  return validTypes;
}
