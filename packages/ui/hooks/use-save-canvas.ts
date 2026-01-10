'use client';

import { useState, useCallback } from 'react';
import type { Node, Edge } from 'reactflow';
import type { SourceType } from '../contexts/canvas-context';

interface SupabaseClient {
  from: (table: string) => {
    update: (data: Record<string, unknown>) => {
      eq: (column: string, value: string) => Promise<{ error: Error | null }>;
    };
  };
}

interface UseSaveCanvasProps {
  sourceType: SourceType;
  sourceId: string;
  supabase: SupabaseClient;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseSaveCanvasReturn {
  save: (nodes: Node[], edges: Edge[]) => Promise<void>;
  saving: boolean;
}

export function useSaveCanvas({
  sourceType,
  sourceId,
  supabase,
  onSuccess,
  onError,
}: UseSaveCanvasProps): UseSaveCanvasReturn {
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (nodes: Node[], edges: Edge[]) => {
      if (!sourceId) return;
      
      setSaving(true);

      try {
        // Determine table based on source type
        const table = sourceType === 'map' ? 'maps' : 'product_views';

        // Serialize nodes and edges to avoid Supabase JSONB issues
        const { error } = await supabase
          .from(table)
          .update({
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', sourceId);

        if (error) throw error;

        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setSaving(false);
      }
    },
    [sourceType, sourceId, supabase, onSuccess, onError]
  );

  return { save, saving };
}
