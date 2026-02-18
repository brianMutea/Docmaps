// Sanitization validator for cleaning node data

import type { ExtractedNode } from '../types';
import { sanitizeText, truncateDescription, isValidUrl } from '../utils';

/**
 * Sanitize a single node's data
 * @param node - Node to sanitize
 * @returns Sanitized node
 */
export function sanitizeNode(node: ExtractedNode): ExtractedNode {
  return {
    ...node,
    data: {
      ...node.data,
      // Clean label
      label: sanitizeText(node.data.label),
      
      // Clean and truncate description
      description: node.data.description
        ? truncateDescription(sanitizeText(node.data.description), 200)
        : undefined,
      
      // Validate and clean URL
      docUrl: node.data.docUrl && isValidUrl(node.data.docUrl)
        ? node.data.docUrl
        : undefined,
      
      // Clean tags
      tags: node.data.tags
        ? node.data.tags.map(tag => sanitizeText(tag)).filter(tag => tag.length > 0)
        : undefined,
      
      // Clean additional links
      additionalLinks: node.data.additionalLinks
        ? node.data.additionalLinks
            .map(link => ({
              title: sanitizeText(link.title),
              url: link.url,
            }))
            .filter(link => link.title.length > 0 && isValidUrl(link.url))
        : undefined,
    },
  };
}

/**
 * Sanitize an array of nodes
 * @param nodes - Nodes to sanitize
 * @returns Sanitized nodes
 */
export function sanitizeNodes(nodes: ExtractedNode[]): ExtractedNode[] {
  return nodes.map(node => sanitizeNode(node));
}

/**
 * Remove potentially dangerous content from text
 * @param text - Text to clean
 * @returns Cleaned text
 */
export function removeDangerousContent(text: string): string {
  // Remove script tags
  let cleaned = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: URLs
  cleaned = cleaned.replace(/javascript:/gi, '');
  
  return cleaned;
}

/**
 * Validate that all node data is safe and clean
 * @param node - Node to validate
 * @returns true if node is safe
 */
export function isNodeSafe(node: ExtractedNode): boolean {
  // Check label
  if (node.data.label.includes('<script')) return false;
  if (node.data.label.includes('javascript:')) return false;
  
  // Check description
  if (node.data.description) {
    if (node.data.description.includes('<script')) return false;
    if (node.data.description.includes('javascript:')) return false;
  }
  
  // Check URLs
  if (node.data.docUrl && node.data.docUrl.startsWith('javascript:')) return false;
  
  return true;
}
