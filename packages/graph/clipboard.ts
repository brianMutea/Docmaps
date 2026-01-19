/**
 * Clipboard utilities for copy/paste operations
 */

import type { Node, Edge } from 'reactflow';

interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
}

const PASTE_OFFSET = 50;

/**
 * Copy selected nodes and their interconnecting edges to clipboard
 */
export function copyNodesToClipboard(nodes: Node[], allEdges: Edge[]): void {
  if (nodes.length === 0) return;

  const nodeIds = new Set(nodes.map(n => n.id));
  
  // Find edges that connect copied nodes
  const relevantEdges = allEdges.filter(
    edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  const clipboardData: ClipboardData = {
    nodes,
    edges: relevantEdges,
  };

  // Store in sessionStorage for persistence across renders
  sessionStorage.setItem('docmaps-clipboard', JSON.stringify(clipboardData));
}

/**
 * Paste nodes from clipboard with offset positioning
 */
export function pasteNodesFromClipboard(
  existingNodes: Node[],
  existingEdges: Edge[],
  pastePosition?: { x: number; y: number }
): { nodes: Node[]; edges: Edge[] } {
  const clipboardJson = sessionStorage.getItem('docmaps-clipboard');
  if (!clipboardJson) {
    return { nodes: existingNodes, edges: existingEdges };
  }

  try {
    const clipboardData: ClipboardData = JSON.parse(clipboardJson);
    
    if (!clipboardData.nodes || clipboardData.nodes.length === 0) {
      return { nodes: existingNodes, edges: existingEdges };
    }

    // Calculate offset for pasted nodes
    let offsetX = PASTE_OFFSET;
    let offsetY = PASTE_OFFSET;

    if (pastePosition) {
      // If paste position provided, calculate offset from original position
      const minX = Math.min(...clipboardData.nodes.map(n => n.position.x));
      const minY = Math.min(...clipboardData.nodes.map(n => n.position.y));
      offsetX = pastePosition.x - minX;
      offsetY = pastePosition.y - minY;
    }

    // Create ID mapping for nodes
    const idMap = new Map<string, string>();
    const timestamp = Date.now();

    // Clone nodes with new IDs and offset positions
    const newNodes = clipboardData.nodes.map((node, index) => {
      const newId = `node-${timestamp}-${index}`;
      idMap.set(node.id, newId);

      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY,
        },
        selected: true, // Select pasted nodes
        data: {
          ...node.data,
        },
      };
    });

    // Clone edges with updated node IDs
    const newEdges: Edge[] = [];
    
    for (let index = 0; index < clipboardData.edges.length; index++) {
      const edge = clipboardData.edges[index];
      const newSourceId = idMap.get(edge.source);
      const newTargetId = idMap.get(edge.target);

      if (newSourceId && newTargetId) {
        newEdges.push({
          ...edge,
          id: `edge-${timestamp}-${index}`,
          source: newSourceId,
          target: newTargetId,
          selected: false,
        });
      }
    }

    // Deselect existing nodes
    const updatedExistingNodes = existingNodes.map(node => ({
      ...node,
      selected: false,
    }));

    return {
      nodes: [...updatedExistingNodes, ...newNodes],
      edges: [...existingEdges, ...newEdges],
    };
  } catch (error) {
    console.error('Failed to paste from clipboard:', error);
    return { nodes: existingNodes, edges: existingEdges };
  }
}

/**
 * Check if clipboard has data
 */
export function hasClipboardData(): boolean {
  const clipboardJson = sessionStorage.getItem('docmaps-clipboard');
  return clipboardJson !== null;
}

/**
 * Clear clipboard data
 */
export function clearClipboard(): void {
  sessionStorage.removeItem('docmaps-clipboard');
}
