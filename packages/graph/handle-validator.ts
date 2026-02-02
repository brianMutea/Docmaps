import type { Node, Connection, Edge } from 'reactflow';
import type { NodeType } from './handle-config';
import type { EdgeType } from './edge-types';
import {
  isValidConnection as isValidConnectionByEdgeType,
  getValidTargetTypes as getValidTargetTypesByEdgeType,
  getConnectionInvalidReason,
  getValidEdgeTypes,
} from './connection-rules';

export interface ConnectionValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Validates a connection between two nodes.
 * If an edge type is specified in the connection data, validates against that edge type's rules.
 * Otherwise, checks if ANY edge type would allow the connection.
 */
export function validateConnection(
  connection: Connection,
  nodes: Node[],
  edges: Edge[],
  edgeType?: EdgeType
): ConnectionValidationResult {
  if (!connection.source || !connection.target) {
    return { isValid: false, reason: 'Missing source or target' };
  }

  if (connection.source === connection.target) {
    return { isValid: false, reason: 'Cannot connect node to itself' };
  }

  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  if (!sourceNode || !targetNode) {
    return { isValid: false, reason: 'Source or target node not found' };
  }

  const sourceType = sourceNode.type as NodeType;
  const targetType = targetNode.type as NodeType;

  if (!sourceType || !targetType) {
    return { isValid: false, reason: 'Invalid node type' };
  }

  // If edge type is specified, validate against that specific edge type
  if (edgeType) {
    const isValid = isValidConnectionByEdgeType(sourceType, targetType, edgeType);
    if (!isValid) {
      return {
        isValid: false,
        reason: getConnectionInvalidReason(sourceType, targetType, edgeType),
      };
    }
  } else {
    // If no edge type specified, check if ANY edge type allows this connection
    const validEdgeTypes = getValidEdgeTypes(sourceType, targetType);
    if (validEdgeTypes.length === 0) {
      return {
        isValid: false,
        reason: `No edge type allows connection from ${sourceType} to ${targetType}`,
      };
    }
  }

  // Check for duplicate connections
  const existingConnection = edges.find(
    (edge) =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle
  );

  if (existingConnection) {
    return { isValid: false, reason: 'Connection already exists' };
  }

  return { isValid: true };
}

/**
 * Check if a connection is valid for a specific edge type
 */
export function isValidConnectionType(
  sourceType: NodeType,
  targetType: NodeType,
  edgeType?: EdgeType
): boolean {
  if (edgeType) {
    return isValidConnectionByEdgeType(sourceType, targetType, edgeType);
  }
  
  // If no edge type specified, check if ANY edge type allows this connection
  const validEdgeTypes = getValidEdgeTypes(sourceType, targetType);
  return validEdgeTypes.length > 0;
}

/**
 * Get valid target types for a source type and optional edge type
 */
export function getValidTargetTypes(
  sourceType: NodeType,
  edgeType?: EdgeType
): NodeType[] {
  if (edgeType) {
    return getValidTargetTypesByEdgeType(sourceType, edgeType);
  }
  
  // If no edge type specified, return all possible targets across all edge types
  const allTargets = new Set<NodeType>();
  const allNodeTypes: NodeType[] = ['product', 'feature', 'component', 'textBlock', 'group'];
  
  allNodeTypes.forEach(targetType => {
    if (getValidEdgeTypes(sourceType, targetType).length > 0) {
      allTargets.add(targetType);
    }
  });
  
  return Array.from(allTargets);
}

/**
 * Check if a node can accept a connection from a source type
 */
export function canNodeAcceptConnection(
  node: Node,
  sourceType: NodeType,
  edgeType?: EdgeType
): boolean {
  const nodeType = node.type as NodeType;
  if (!nodeType) return false;

  return isValidConnectionType(sourceType, nodeType, edgeType);
}

/**
 * Get visual feedback for a connection attempt
 */
export function getConnectionFeedback(
  sourceType: NodeType,
  targetType: NodeType,
  edgeType?: EdgeType
): { className: string; message: string } {
  const isValid = isValidConnectionType(sourceType, targetType, edgeType);

  if (isValid) {
    return {
      className: 'ring-2 ring-green-400 ring-offset-2',
      message: 'Valid connection',
    };
  }

  const reason = edgeType 
    ? getConnectionInvalidReason(sourceType, targetType, edgeType)
    : `No edge type allows connection from ${sourceType} to ${targetType}`;

  return {
    className: 'ring-2 ring-red-400 ring-offset-2 opacity-50',
    message: reason,
  };
}
