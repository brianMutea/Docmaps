// In-memory caching layer for fetched documentation

import { hashUrl } from './utils';

/**
 * Cache entry structure
 */
interface CacheEntry {
  /** Cached HTML content */
  html: string;
  /** Timestamp when entry was cached */
  cachedAt: number;
  /** Time-to-live in milliseconds */
  ttl: number;
}

/**
 * In-memory cache with TTL and LRU eviction
 */
class DocumentationCache {
  private cache: Map<string, CacheEntry>;
  private readonly maxEntries: number;
  private accessOrder: string[]; // For LRU tracking

  constructor(maxEntries: number = 100) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.accessOrder = [];
  }

  /**
   * Get cached HTML for a URL
   * Returns null if not cached or expired
   * 
   * @param url - URL to look up
   * @returns Cached HTML or null
   */
  get(url: string): string | null {
    const key = hashUrl(url);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.cachedAt > entry.ttl) {
      // Expired, remove from cache
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(key);

    return entry.html;
  }

  /**
   * Cache HTML for a URL with TTL
   * 
   * @param url - URL to cache
   * @param html - HTML content to cache
   * @param ttl - Time-to-live in milliseconds (default: 1 hour)
   */
  set(url: string, html: string, ttl: number = 3600000): void {
    const key = hashUrl(url);

    // Evict if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    // Store entry
    this.cache.set(key, {
      html,
      cachedAt: Date.now(),
      ttl,
    });

    // Update access order
    this.updateAccessOrder(key);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if URL is cached (and not expired)
   */
  has(url: string): boolean {
    return this.get(url) !== null;
  }

  /**
   * Update access order for LRU tracking
   */
  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) {
      return;
    }

    // Remove least recently used (first in array)
    const lruKey = this.accessOrder.shift();
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
}

// Singleton cache instance
const cache = new DocumentationCache();

/**
 * Get cached HTML for a URL
 * 
 * @param url - URL to look up
 * @returns Cached HTML or null if not cached/expired
 */
export function getCached(url: string): string | null {
  return cache.get(url);
}

/**
 * Cache HTML for a URL
 * 
 * @param url - URL to cache
 * @param html - HTML content to cache
 * @param ttl - Time-to-live in milliseconds (default: 1 hour)
 */
export function setCached(url: string, html: string, ttl: number = 3600000): void {
  cache.set(url, html, ttl);
}

/**
 * Clear all cached entries
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get current cache size
 */
export function getCacheSize(): number {
  return cache.size();
}

/**
 * Check if URL is cached
 */
export function isCached(url: string): boolean {
  return cache.has(url);
}
