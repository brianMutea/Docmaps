// Utility functions for doc-parser package

import type { NodeType } from '@docmaps/database';

/**
 * Generate a unique node ID from label and type
 * Uses a deterministic approach for consistency
 * 
 * @param label - Node label text
 * @param type - Node type (product, feature, component, etc.)
 * @returns Unique node ID string
 */
export function generateNodeId(label: string, type: NodeType): string {
  if (!label || typeof label !== 'string') {
    throw new Error('Label must be a non-empty string');
  }
  
  if (!type || typeof type !== 'string') {
    throw new Error('Type must be a non-empty string');
  }

  // Sanitize label: lowercase, remove special chars, replace spaces with hyphens
  const sanitized = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Combine type and sanitized label
  return `${type}-${sanitized}`;
}

/**
 * Sanitize text by removing HTML entities, extra whitespace, and control characters
 * 
 * @param text - Raw text to sanitize
 * @returns Sanitized text string
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncate description to a maximum length, adding ellipsis if needed
 * Tries to break at word boundaries for readability
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 200)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateDescription(text: string, maxLength: number = 200): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (maxLength <= 0) {
    throw new Error('maxLength must be greater than 0');
  }

  // First sanitize the text
  const sanitized = sanitizeText(text);

  // If already short enough, return as-is
  if (sanitized.length <= maxLength) {
    return sanitized;
  }

  // Truncate to maxLength and try to break at word boundary
  const truncated = sanitized.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If we found a space and it's not too far back, break there
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }

  // Otherwise just truncate at maxLength
  return truncated + '...';
}

/**
 * Validate if a string is a valid URL
 * Checks for HTTPS protocol and valid URL format
 * 
 * @param url - URL string to validate
 * @returns true if valid HTTPS URL, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    
    // Must be HTTPS for security
    if (parsed.protocol !== 'https:') {
      return false;
    }

    // Must have a hostname
    if (!parsed.hostname) {
      return false;
    }

    // Block localhost and private IPs for SSRF prevention
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.2') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname === '[::1]' ||
      hostname === '::1'
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a hash of a URL for caching purposes
 * Uses a simple but effective string hashing algorithm
 * 
 * @param url - URL to hash
 * @returns Hash string
 */
export function hashUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  // Simple hash function (djb2 algorithm)
  let hash = 5381;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) + hash) + url.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to positive hex string
  return Math.abs(hash).toString(16);
}

/**
 * Sleep helper for adding delays (useful for streaming)
 * 
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
export function sleep(ms: number): Promise<void> {
  if (typeof ms !== 'number' || ms < 0) {
    throw new Error('Sleep duration must be a non-negative number');
  }

  return new Promise(resolve => setTimeout(resolve, ms));
}
