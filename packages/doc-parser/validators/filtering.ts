// Filtering validator for removing irrelevant nodes

import type { ExtractedNode } from '../types';

/**
 * List of labels to exclude (navigation elements, etc.)
 */
const EXCLUDED_LABELS = [
  'home',
  'about',
  'contact',
  'privacy',
  'terms',
  'login',
  'sign up',
  'signup',
  'sign in',
  'signin',
  'search',
  'menu',
  'navigation',
  'footer',
  'header',
  'sidebar',
  'back',
  'next',
  'previous',
  'skip',
  'close',
  'cancel',
];

/**
 * Maximum number of nodes to keep
 */
const MAX_NODES = 50;

/**
 * Minimum label length
 */
const MIN_LABEL_LENGTH = 3;

/**
 * Maximum label length
 */
const MAX_LABEL_LENGTH = 100;

/**
 * Calculate priority score for a node
 * Higher score = higher priority
 * @param node - Node to score
 * @returns Priority score
 */
function calculatePriority(node: ExtractedNode): number {
  let score = 0;

  // Type priority
  if (node.type === 'product') score += 100;
  else if (node.type === 'feature') score += 50;
  else if (node.type === 'component') score += 25;

  // Data completeness
  if (node.data.description) score += 10;
  if (node.data.docUrl) score += 5;
  if (node.data.icon) score += 3;
  if (node.data.tags && node.data.tags.length > 0) score += 2;

  // Level (lower level = higher priority)
  if (node.level) {
    score += (4 - node.level) * 5;
  }

  return score;
}

/**
 * Filter nodes based on various criteria
 * @param nodes - Array of nodes to filter
 * @param options - Filtering options
 * @returns Filtered nodes
 */
export function filterNodes(
  nodes: ExtractedNode[],
  options: {
    maxNodes?: number;
    minLabelLength?: number;
    maxLabelLength?: number;
    excludedLabels?: string[];
    requireDescription?: boolean;
  } = {}
): ExtractedNode[] {
  const {
    maxNodes = MAX_NODES,
    minLabelLength = MIN_LABEL_LENGTH,
    maxLabelLength = MAX_LABEL_LENGTH,
    excludedLabels = EXCLUDED_LABELS,
    requireDescription = false,
  } = options;

  // Apply filters
  let filtered = nodes.filter(node => {
    // Check label length
    if (node.data.label.length < minLabelLength) return false;
    if (node.data.label.length > maxLabelLength) return false;

    // Check excluded labels
    const normalized = node.data.label.toLowerCase().trim();
    if (excludedLabels.some(excluded => normalized === excluded)) return false;

    // Check description requirement
    if (requireDescription && !node.data.description) return false;

    return true;
  });

  // Limit to max nodes by priority
  if (filtered.length > maxNodes) {
    // Sort by priority (highest first)
    filtered.sort((a, b) => calculatePriority(b) - calculatePriority(a));
    filtered = filtered.slice(0, maxNodes);
  }

  return filtered;
}

/**
 * Get statistics about filtered nodes
 * @param originalCount - Original node count
 * @param filteredCount - Filtered node count
 * @returns Statistics object
 */
export function getFilterStats(originalCount: number, filteredCount: number) {
  return {
    original: originalCount,
    filtered: filteredCount,
    removed: originalCount - filteredCount,
    removalRate: originalCount > 0 ? (originalCount - filteredCount) / originalCount : 0,
  };
}
