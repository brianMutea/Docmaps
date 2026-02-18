import { useState, useEffect, useRef, useCallback } from 'react';
import type { Node, Edge } from 'reactflow';

interface GenerationState {
  status: string;
  nodes: Node[];
  edges: Edge[];
  error: string | null;
  complete: boolean;
  mapId: string | null;
}

interface UseMapGenerationReturn extends GenerationState {
  cancel: () => void;
}

/**
 * Hook for managing map generation via SSE
 * @param url - Documentation URL to generate from
 * @param enabled - Whether to start generation
 */
export function useMapGeneration(url: string | null, enabled: boolean): UseMapGenerationReturn {
  const [state, setState] = useState<GenerationState>({
    status: '',
    nodes: [],
    edges: [],
    error: null,
    complete: false,
    mapId: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  const cancel = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!url || !enabled) {
      return;
    }

    // Create EventSource for SSE
    const eventSource = new EventSource(`/api/generate-map?url=${encodeURIComponent(url)}`);
    eventSourceRef.current = eventSource;

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'status':
            setState((prev) => ({
              ...prev,
              status: data.data?.message || data.message || '',
            }));
            break;

          case 'node':
            setState((prev) => ({
              ...prev,
              nodes: [...prev.nodes, data.data],
            }));
            break;

          case 'edge':
            setState((prev) => ({
              ...prev,
              edges: [...prev.edges, data.data],
            }));
            break;

          case 'layout':
            setState((prev) => ({
              ...prev,
              nodes: data.data.nodes,
            }));
            break;

          case 'complete':
            setState((prev) => ({
              ...prev,
              complete: true,
              mapId: data.data?.mapId || data.mapId,
            }));
            eventSource.close();
            break;

          case 'error':
            setState((prev) => ({
              ...prev,
              error: data.data?.message || data.message || 'An error occurred',
              complete: true,
            }));
            eventSource.close();
            break;

          default:
            console.warn('Unknown event type:', data.type);
        }
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    // Handle errors
    eventSource.onerror = () => {
      setState((prev) => ({
        ...prev,
        error: 'Connection to server lost',
        complete: true,
      }));
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [url, enabled]);

  return {
    ...state,
    cancel,
  };
}
