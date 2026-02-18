// Deduplication validator for removing duplicate nodes

import { distance } from 'fastest-levenshtein';
import type { ExtractedNode, ExtractedEdge } from '../types';

/**
 * Calculate similarity between two strings using Levenshtein distance
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score between 0 and 1
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const dist = distance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - dist / maxLength;
}

/**
 * Check if a node has more complete data than another
 * @param node1 - First node
 * @param node2 - Second node
 * @returns true if node1 is more complete
 */
function isMoreComplete(node1: ExtractedNode, node2: ExtractedNode): boolean {
  let score1 = 0;
  let score2 = 0;

  // Score based on data completeness
  if (node1.data.description) score1 += 2;
  if (node1.data.docUrl) score1 += 1;
  if (node1.data.icon) score1 += 1;
  if (node1.data.tags && node1.data.tags.length > 0) score1 += 1;

  if (node2.data.description) score2 += 2;
  if (node2.data.docUrl) score2 += 1;
  if (node2.data.icon) score2 += 1;
  if (node2.data.tags && node2.data.tags.length > 0) score2 += 1;

  return score1 > score2;
}

/**
 * Merge two nodes, keeping the most complete data
 * @param node1 - First node
 * @param node2 - Second node
 * @returns Merged node
 */
function mergeNodes(node1: ExtractedNode, node2: ExtractedNode): ExtractedNode {
  const primary = isMoreComplete(node1, node2) ? node1 : node2;
  const secondary = primary === node1 ? node2 : node1;

  return {
    ...primary,
    data: {
      label: primary.data.label,
      description: primary.data.description || secondary.data.description,
      icon: primary.data.icon || secondary.data.icon,
      color: primary.data.color || secondary.data.color,
      tags: [...(primary.data.tags || []), ...(secondary.data.tags || [])].filter(
        (tag, index, self) => self.indexOf(tag) === index
      ),
      docUrl: primary.data.docUrl || secondary.data.docUrl,
      additionalLinks: [
        ...(primary.data.additionalLinks || []),
        ...(secondary.data.additionalLinks || []),
      ],
    },
  };
}

/**
 * Deduplicate nodes based on label similarity
 * @param nodes - Array of nodes to deduplicate
 * @param threshold - Similarity threshold (default 0.85 = 85%)
 * @returns Object with deduplicated nodes and ID mapping
 */
export function deduplicateNodes(
  nodes: ExtractedNode[],
  threshold: number = 0.85
): { nodes: ExtractedNode[]; idMapping: Map<string, string> } {
  const deduplicated: ExtractedNode[] = [];
  const idMapping = new Map<string, string>();
  const processed = new Set<number>();

  for (let i = 0; i < nodes.length; i++) {
    if (processed.has(i)) continue;

    const node1 = nodes[i];
    const duplicates: number[] = [i];

    // Find duplicates
    for (let j = i + 1; j < nodes.length; j++) {
      if (processed.has(j)) continue;

      const node2 = nodes[j];

      // Only compare nodes of the same type
      if (node1.type !== node2.type) continue;

      const similarity = calculateSimilarity(node1.data.label, node2.data.label);

      if (similarity >= threshold) {
        duplicates.push(j);
        processed.add(j);
      }
    }

    // Merge all duplicates
    let mergedNode = node1;
    for (let k = 1; k < duplicates.length; k++) {
      mergedNode = mergeNodes(mergedNode, nodes[duplicates[k]]);
    }

    deduplicated.push(mergedNode);

    // Map all duplicate IDs to the merged node ID
    for (const dupIndex of duplicates) {
      idMapping.set(nodes[dupIndex].id, mergedNode.id);
    }
  }

  return { nodes: deduplicated, idMapping };
}

/**
 * Update edge references after deduplication
 * @param edges - Array of edges
 * @param idMapping - Mapping of old IDs to new IDs
 * @returns Updated edges with remapped IDs
 */
export function updateEdgeReferences(
  edges: ExtractedEdge[],
  idMapping: Map<string, string>
): ExtractedEdge[] {
  const updatedEdges: ExtractedEdge[] = [];
  const edgeSet = new Set<string>();

  for (const edge of edges) {
    const newSource = idMapping.get(edge.source) || edge.source;
    const newTarget = idMapping.get(edge.target) || edge.target;

    // Skip self-referencing edges
    if (newSource === newTarget) continue;

    // Create unique edge key to avoid duplicates
    const edgeKey = `${newSource}-${newTarget}-${edge.type || 'default'}`;

    if (!edgeSet.has(edgeKey)) {
      updatedEdges.push({
        ...edge,
        id: `${newSource}-${newTarget}`,
        source: newSource,
        target: newTarget,
      });
      edgeSet.add(edgeKey);
    }
  }

  return updatedEdges;
}
