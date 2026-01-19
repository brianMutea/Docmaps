import type { Node, Connection, Edge } from 'reactflow';
import type { NodeType } from './handle-config';

export interface ConnectionValidationResult {
  isValid: boolean;
  reason?: string;
}

const CONNECTION_RULES: Record<NodeType, { canConnectTo: NodeType[] }> = {
  product: {
    canConnectTo: ['product', 'feature', 'component', 'textBlock'],
  },
  feature: {
    canConnectTo: ['feature', 'component', 'textBlock'],
  },
  component: {
    canConnectTo: ['component', 'textBlock'],
  },
  textBlock: {
    canConnectTo: ['product', 'feature', 'component', 'textBlock'],
  },
};

export function validateConnection(
  connection: Connection,
  nodes: Node[],
  edges: Edge[]
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

  const rules = CONNECTION_RULES[sourceType];
  if (!rules.canConnectTo.includes(targetType)) {
    return {
      isValid: false,
      reason: `${sourceType} cannot connect to ${targetType}`,
    };
  }

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

export function isValidConnectionType(
  sourceType: NodeType,
  targetType: NodeType
): boolean {
  const rules = CONNECTION_RULES[sourceType];
  return rules.canConnectTo.includes(targetType);
}

export function getValidTargetTypes(sourceType: NodeType): NodeType[] {
  return CONNECTION_RULES[sourceType].canConnectTo;
}

export function canNodeAcceptConnection(
  node: Node,
  sourceType: NodeType
): boolean {
  const nodeType = node.type as NodeType;
  if (!nodeType) return false;

  const rules = CONNECTION_RULES[sourceType];
  return rules.canConnectTo.includes(nodeType);
}

export function getConnectionFeedback(
  sourceType: NodeType,
  targetType: NodeType
): { className: string; message: string } {
  const isValid = isValidConnectionType(sourceType, targetType);

  if (isValid) {
    return {
      className: 'ring-2 ring-green-400 ring-offset-2',
      message: 'Valid connection',
    };
  }

  return {
    className: 'ring-2 ring-red-400 ring-offset-2 opacity-50',
    message: `Cannot connect ${sourceType} to ${targetType}`,
  };
}
