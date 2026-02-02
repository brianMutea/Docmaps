import { Position } from 'reactflow';

export type NodeType = 'product' | 'feature' | 'component' | 'textBlock' | 'group';

export interface HandleConfig {
  id: string;
  type: 'source' | 'target';
  position: Position;
  style?: React.CSSProperties;
}

export interface NodeHandleConfig {
  nodeType: NodeType;
  handles: HandleConfig[];
}

const HANDLE_STYLE = {
  width: 10,
  height: 10,
  border: '2px solid #fff',
  background: '#3b82f6',
};

export const NODE_HANDLE_CONFIGS: Record<NodeType, HandleConfig[]> = {
  product: [
    {
      id: 'top-target',
      type: 'target',
      position: Position.Top,
      style: HANDLE_STYLE,
    },
    {
      id: 'bottom-source',
      type: 'source',
      position: Position.Bottom,
      style: HANDLE_STYLE,
    },
    {
      id: 'left-target',
      type: 'target',
      position: Position.Left,
      style: HANDLE_STYLE,
    },
    {
      id: 'left-source',
      type: 'source',
      position: Position.Left,
      style: { ...HANDLE_STYLE, left: -5 },
    },
    {
      id: 'right-target',
      type: 'target',
      position: Position.Right,
      style: HANDLE_STYLE,
    },
    {
      id: 'right-source',
      type: 'source',
      position: Position.Right,
      style: { ...HANDLE_STYLE, right: -5 },
    },
  ],
  feature: [
    {
      id: 'top-target',
      type: 'target',
      position: Position.Top,
      style: HANDLE_STYLE,
    },
    {
      id: 'bottom-source',
      type: 'source',
      position: Position.Bottom,
      style: HANDLE_STYLE,
    },
    {
      id: 'left-target',
      type: 'target',
      position: Position.Left,
      style: HANDLE_STYLE,
    },
    {
      id: 'left-source',
      type: 'source',
      position: Position.Left,
      style: { ...HANDLE_STYLE, left: -5 },
    },
    {
      id: 'right-target',
      type: 'target',
      position: Position.Right,
      style: HANDLE_STYLE,
    },
    {
      id: 'right-source',
      type: 'source',
      position: Position.Right,
      style: { ...HANDLE_STYLE, right: -5 },
    },
  ],
  component: [
    {
      id: 'top-target',
      type: 'target',
      position: Position.Top,
      style: HANDLE_STYLE,
    },
    {
      id: 'bottom-source',
      type: 'source',
      position: Position.Bottom,
      style: HANDLE_STYLE,
    },
    {
      id: 'left-target',
      type: 'target',
      position: Position.Left,
      style: HANDLE_STYLE,
    },
    {
      id: 'left-source',
      type: 'source',
      position: Position.Left,
      style: { ...HANDLE_STYLE, left: -5 },
    },
    {
      id: 'right-target',
      type: 'target',
      position: Position.Right,
      style: HANDLE_STYLE,
    },
    {
      id: 'right-source',
      type: 'source',
      position: Position.Right,
      style: { ...HANDLE_STYLE, right: -5 },
    },
  ],
  textBlock: [
    {
      id: 'top-target',
      type: 'target',
      position: Position.Top,
      style: HANDLE_STYLE,
    },
    {
      id: 'bottom-source',
      type: 'source',
      position: Position.Bottom,
      style: HANDLE_STYLE,
    },
  ],
  group: [
    {
      id: 'top-target',
      type: 'target',
      position: Position.Top,
      style: HANDLE_STYLE,
    },
    {
      id: 'bottom-source',
      type: 'source',
      position: Position.Bottom,
      style: HANDLE_STYLE,
    },
    {
      id: 'left-target',
      type: 'target',
      position: Position.Left,
      style: HANDLE_STYLE,
    },
    {
      id: 'left-source',
      type: 'source',
      position: Position.Left,
      style: { ...HANDLE_STYLE, left: -5 },
    },
    {
      id: 'right-target',
      type: 'target',
      position: Position.Right,
      style: HANDLE_STYLE,
    },
    {
      id: 'right-source',
      type: 'source',
      position: Position.Right,
      style: { ...HANDLE_STYLE, right: -5 },
    },
  ],
};

export function getHandlesForNodeType(nodeType: NodeType): HandleConfig[] {
  return NODE_HANDLE_CONFIGS[nodeType] || [];
}

export function isValidNodeType(type: string): type is NodeType {
  return ['product', 'feature', 'component', 'textBlock', 'group'].includes(type);
}

export function getHandleById(nodeType: NodeType, handleId: string): HandleConfig | undefined {
  const handles = getHandlesForNodeType(nodeType);
  return handles.find((h) => h.id === handleId);
}

export function getSourceHandles(nodeType: NodeType): HandleConfig[] {
  return getHandlesForNodeType(nodeType).filter((h) => h.type === 'source');
}

export function getTargetHandles(nodeType: NodeType): HandleConfig[] {
  return getHandlesForNodeType(nodeType).filter((h) => h.type === 'target');
}
