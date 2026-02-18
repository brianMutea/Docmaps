// Unit tests for doc-parser cache functions

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCached, setCached, clearCache, getCacheSize, isCached } from './cache';

describe('cache', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearCache();
  });

  describe('setCached and getCached', () => {
    it('should cache and retrieve HTML', () => {
      const url = 'https://example.com';
      const html = '<html><body>Test</body></html>';

      setCached(url, html);
      const cached = getCached(url);

      expect(cached).toBe(html);
    });

    it('should return null for uncached URL', () => {
      const cached = getCached('https://example.com');
      expect(cached).toBeNull();
    });

    it('should cache multiple URLs', () => {
      setCached('https://example.com/page1', '<html>Page 1</html>');
      setCached('https://example.com/page2', '<html>Page 2</html>');
      setCached('https://example.com/page3', '<html>Page 3</html>');

      expect(getCached('https://example.com/page1')).toBe('<html>Page 1</html>');
      expect(getCached('https://example.com/page2')).toBe('<html>Page 2</html>');
      expect(getCached('https://example.com/page3')).toBe('<html>Page 3</html>');
    });

    it('should overwrite existing cache entry', () => {
      const url = 'https://example.com';
      setCached(url, '<html>First</html>');
      setCached(url, '<html>Second</html>');

      expect(getCached(url)).toBe('<html>Second</html>');
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', () => {
      vi.useFakeTimers();

      const url = 'https://example.com';
      const html = '<html>Test</html>';
      const ttl = 1000; // 1 second

      setCached(url, html, ttl);
      expect(getCached(url)).toBe(html);

      // Advance time past TTL
      vi.advanceTimersByTime(1001);

      expect(getCached(url)).toBeNull();

      vi.useRealTimers();
    });

    it('should not expire before TTL', () => {
      vi.useFakeTimers();

      const url = 'https://example.com';
      const html = '<html>Test</html>';
      const ttl = 1000; // 1 second

      setCached(url, html, ttl);

      // Advance time but not past TTL
      vi.advanceTimersByTime(500);

      expect(getCached(url)).toBe(html);

      vi.useRealTimers();
    });

    it('should use default TTL of 1 hour', () => {
      vi.useFakeTimers();

      const url = 'https://example.com';
      const html = '<html>Test</html>';

      setCached(url, html); // No TTL specified

      // Advance time by 59 minutes (should still be cached)
      vi.advanceTimersByTime(59 * 60 * 1000);
      expect(getCached(url)).toBe(html);

      // Advance past 1 hour
      vi.advanceTimersByTime(2 * 60 * 1000);
      expect(getCached(url)).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used entry when at capacity', () => {
      // Fill cache to capacity (100 entries)
      for (let i = 0; i < 100; i++) {
        setCached(`https://example.com/page${i}`, `<html>Page ${i}</html>`);
      }

      expect(getCacheSize()).toBe(100);

      // Access first entry to make it recently used
      getCached('https://example.com/page0');

      // Add one more entry (should evict page1, not page0)
      setCached('https://example.com/page100', '<html>Page 100</html>');

      expect(getCacheSize()).toBe(100);
      expect(getCached('https://example.com/page0')).toBe('<html>Page 0</html>'); // Still cached
      expect(getCached('https://example.com/page1')).toBeNull(); // Evicted
      expect(getCached('https://example.com/page100')).toBe('<html>Page 100</html>'); // New entry
    });

    it('should maintain LRU order with multiple accesses', () => {
      // Add 3 entries
      setCached('https://example.com/page1', '<html>Page 1</html>');
      setCached('https://example.com/page2', '<html>Page 2</html>');
      setCached('https://example.com/page3', '<html>Page 3</html>');

      // Access page1 to make it most recently used
      getCached('https://example.com/page1');

      // Fill cache to capacity
      for (let i = 4; i <= 100; i++) {
        setCached(`https://example.com/page${i}`, `<html>Page ${i}</html>`);
      }

      // Add one more (should evict page2, not page1)
      setCached('https://example.com/page101', '<html>Page 101</html>');

      expect(getCached('https://example.com/page1')).toBe('<html>Page 1</html>');
      expect(getCached('https://example.com/page2')).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached entries', () => {
      setCached('https://example.com/page1', '<html>Page 1</html>');
      setCached('https://example.com/page2', '<html>Page 2</html>');
      setCached('https://example.com/page3', '<html>Page 3</html>');

      expect(getCacheSize()).toBe(3);

      clearCache();

      expect(getCacheSize()).toBe(0);
      expect(getCached('https://example.com/page1')).toBeNull();
      expect(getCached('https://example.com/page2')).toBeNull();
      expect(getCached('https://example.com/page3')).toBeNull();
    });
  });

  describe('getCacheSize', () => {
    it('should return 0 for empty cache', () => {
      expect(getCacheSize()).toBe(0);
    });

    it('should return correct size', () => {
      setCached('https://example.com/page1', '<html>Page 1</html>');
      expect(getCacheSize()).toBe(1);

      setCached('https://example.com/page2', '<html>Page 2</html>');
      expect(getCacheSize()).toBe(2);

      setCached('https://example.com/page3', '<html>Page 3</html>');
      expect(getCacheSize()).toBe(3);
    });

    it('should not increase size when overwriting', () => {
      setCached('https://example.com', '<html>First</html>');
      expect(getCacheSize()).toBe(1);

      setCached('https://example.com', '<html>Second</html>');
      expect(getCacheSize()).toBe(1);
    });
  });

  describe('isCached', () => {
    it('should return true for cached URL', () => {
      setCached('https://example.com', '<html>Test</html>');
      expect(isCached('https://example.com')).toBe(true);
    });

    it('should return false for uncached URL', () => {
      expect(isCached('https://example.com')).toBe(false);
    });

    it('should return false for expired entry', () => {
      vi.useFakeTimers();

      setCached('https://example.com', '<html>Test</html>', 1000);
      expect(isCached('https://example.com')).toBe(true);

      vi.advanceTimersByTime(1001);
      expect(isCached('https://example.com')).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('cache key generation', () => {
    it('should use URL hash as cache key', () => {
      const url1 = 'https://example.com/page';
      const url2 = 'https://example.com/page'; // Same URL

      setCached(url1, '<html>Test</html>');
      expect(getCached(url2)).toBe('<html>Test</html>');
    });

    it('should differentiate between different URLs', () => {
      setCached('https://example.com/page1', '<html>Page 1</html>');
      setCached('https://example.com/page2', '<html>Page 2</html>');

      expect(getCached('https://example.com/page1')).toBe('<html>Page 1</html>');
      expect(getCached('https://example.com/page2')).toBe('<html>Page 2</html>');
    });
  });

  describe('memory bounds', () => {
    it('should not exceed max entries', () => {
      // Add more than max entries
      for (let i = 0; i < 150; i++) {
        setCached(`https://example.com/page${i}`, `<html>Page ${i}</html>`);
      }

      expect(getCacheSize()).toBe(100);
    });

    it('should maintain max entries after multiple operations', () => {
      // Fill to capacity
      for (let i = 0; i < 100; i++) {
        setCached(`https://example.com/page${i}`, `<html>Page ${i}</html>`);
      }

      // Add and remove multiple times
      for (let i = 100; i < 200; i++) {
        setCached(`https://example.com/page${i}`, `<html>Page ${i}</html>`);
      }

      expect(getCacheSize()).toBe(100);
    });
  });
});
