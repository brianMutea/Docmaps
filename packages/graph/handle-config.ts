import { Position } from 'reactflow';

export type NodeType = 'product' | 'feature' | 'component' | 'textBlock';

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
      id: 'top',
      type: 'target',
      position: Position.Top,
      style: HANDLE_STYLE,
    },
    {
      id: 'bottom',
      type: 'source',
      position: Position.Bottom,
      style: HANDLE_STYLE,
    },
    {
      id: 'left',
      type: 'target',
      position: Position.Left,
      style: HANDLE_STYLE,
    },
    {
      id: 'right',
      type: 'source',
      position: Position.Right,
      style: HANDLE_STYLE,
    },
  ],
  feature: [
    {
      id: 'top',
      type: 'target',
      position: Position.Top,
      style: HANDLE_STYLE,
    },
    {
      id: 'bottom',
      type: 'source',
      position: Position.Bottom,
      style: HANDLE_STYLE,
    },
    {
      id: 'left',
      type: 'target',
      position: Position.Left,
      style: HANDLE_STYLE,
    },
    {
      id: 'right',
      type: 'source',
      position: Position.Right,
      style: HANDLE_STYLE,
    },
  ],
  component: [
    {
      id: 'top',
      type: 'target',
      position: Position.Top,
      style: HANDLE_STYLE,
    },
    {
      id: 'bottom',
      type: 'source',
      position: Position.Bottom,
      style: HANDLE_STYLE,
    },
    {
      id: 'left',
      type: 'target',
      position: Position.Left,
      style: HANDLE_STYLE,
    },
    {
      id: 'right',
      type: 'source',
      position: Position.Right,
      style: HANDLE_STYLE,
    },
  ],
  textBlock: [
    {
      id: 'top',
      type: 'target',
      position: Position.Top,
      style: HANDLE_STYLE,
    },
    {
      id: 'bottom',
      type: 'source',
      position: Position.Bottom,
      style: HANDLE_STYLE,
    },
  ],
};

export function getHandlesForNodeType(nodeType: NodeType): HandleConfig[] {
  return NODE_HANDLE_CONFIGS[nodeType] || [];
}

export function isValidNodeType(type: string): type is NodeType {
  return ['product', 'feature', 'component', 'textBlock'].includes(type);
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
