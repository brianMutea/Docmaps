'use client';

import { Handle } from 'reactflow';
import type { HandleConfig } from '@docmaps/graph/handle-config';

interface HandleRendererProps {
  handles: HandleConfig[];
  handleClassName?: string;
}

/**
 * Reusable component to render handles for any node type.
 * Centralizes handle rendering logic to avoid duplication across node components.
 */
export function HandleRenderer({ handles, handleClassName = '' }: HandleRendererProps) {
  return (
    <>
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className={handleClassName}
          style={handle.style}
        />
      ))}
    </>
  );
}
