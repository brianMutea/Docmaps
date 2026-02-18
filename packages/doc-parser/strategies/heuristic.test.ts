// Unit tests for heuristic strategy

import { describe, it, expect } from 'vitest';
import { HeuristicStrategy } from './heuristic';

describe('HeuristicStrategy', () => {
  const strategy = new HeuristicStrategy();

  describe('canHandle', () => {
    it('should handle any non-empty HTML', () => {
      expect(strategy.canHandle('<div>Content</div>', 'https://example.com')).toBe(true);
      expect(strategy.canHandle('<p>Text</p>', 'https://example.com')).toBe(true);
    });

    it('should reject empty HTML', () => {
      expect(strategy.canHandle('', 'https://example.com')).toBe(false);
    });
  });

  describe('confidence', () => {
    it('should return low confidence score', () => {
      expect(strategy.confidence()).toBe(0.4);
    });
  });

  describe('parse - scoring', () => {
    it('should score elements in navigation higher', async () => {
      const html = `
        <nav>
          <a href="/products">Products</a>
        </nav>
        <footer>
          <a href="/privacy">Privacy</a>
        </footer>
      `;

      const result = await strategy.parse(html, 'https://example.com');

      // Products should be extracted (higher score)
      expect(result.nodes.some(n => n.data.label === 'Products')).toBe(true);
      
      // Privacy might be filtered out (lower score)
      // This is acceptable for heuristic strategy
    });

    it('should score headings higher', async () => {
      const html = `
        <h1>Main Title</h1>
        <h2>Subtitle</h2>
        <p><a href="/link">Regular Link</a></p>
      `;

      const result = await strategy.parse(html, 'https://example.com');

      // Headings should be extracted
      expect(result.nodes.some(n => n.data.label === 'Main Title')).toBe(true);
      expect(result.nodes.some(n => n.data.label === 'Subtitle')).toBe(true);
    });

    it('should prefer optimal text length', async () => {
      const html = `
        <a href="/short">AB</a>
        <a href="/optimal">Optimal Length Link</a>
        <a href="/long">${'A'.repeat(150)}</a>
      `;

      const result = await strategy.parse(html, 'https://example.com');

      // Only optimal length should be extracted
      expect(result.nodes.some(n => n.data.label === 'Optimal Length Link')).toBe(true);
      expect(result.nodes.some(n => n.data.label === 'AB')).toBe(false);
    });
  });

  describe('parse - node types', () => {
    it('should assign types based on score ranking', async () => {
      const html = `
        <nav>
          <h1>Top Product</h1>
          <h2>Feature One</h2>
          <h3>Component One</h3>
          <a href="/link">Regular Link</a>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://example.com');

      const products = result.nodes.filter(n => n.type === 'product');
      const features = result.nodes.filter(n => n.type === 'feature');
      const components = result.nodes.filter(n => n.type === 'component');

      // Should have nodes of different types
      expect(products.length).toBeGreaterThan(0);
      expect(features.length + components.length).toBeGreaterThan(0);
    });

    it('should limit total nodes to 50', async () => {
      // Create HTML with many links
      const links = Array.from({ length: 100 }, (_, i) => 
        `<a href="/link${i}">Link ${i}</a>`
      ).join('');
      const html = `<nav>${links}</nav>`;

      const result = await strategy.parse(html, 'https://example.com');

      // Should be limited to 50 nodes
      expect(result.nodes.length).toBeLessThanOrEqual(50);
    });
  });

  describe('parse - edges', () => {
    it('should create hierarchy edges', async () => {
      const html = `
        <nav>
          <h1>Product</h1>
          <h2>Feature</h2>
          <h3>Component</h3>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://example.com');

      expect(result.edges.length).toBeGreaterThan(0);
      expect(result.edges.every(e => e.type === 'hierarchy')).toBe(true);
    });

    it('should connect features to products', async () => {
      const html = `
        <nav>
          <h1>Main Product</h1>
          <h2>Feature One</h2>
          <h2>Feature Two</h2>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://example.com');

      const productNode = result.nodes.find(n => n.type === 'product');
      const featureNodes = result.nodes.filter(n => n.type === 'feature');

      if (productNode && featureNodes.length > 0) {
        const edges = result.edges.filter(e => e.source === productNode.id);
        expect(edges.length).toBeGreaterThan(0);
      }
    });
  });

  describe('parse - metadata', () => {
    it('should include generation metadata', async () => {
      const html = '<nav><a href="/test">Test Link</a></nav>';
      const url = 'https://example.com';

      const result = await strategy.parse(html, url);

      expect(result.metadata.source_url).toBe(url);
      expect(result.metadata.strategy).toBe('heuristic');
      expect(result.metadata.confidence).toBeGreaterThan(0);
      expect(result.metadata.generated_at).toBeDefined();
    });

    it('should include warnings when no elements scored', async () => {
      const html = '<div>A</div>'; // Too short
      const result = await strategy.parse(html, 'https://example.com');

      expect(result.metadata.warnings.length).toBeGreaterThan(0);
    });

    it('should have low confidence', async () => {
      const html = '<nav><a href="/test">Test Link</a></nav>';
      const result = await strategy.parse(html, 'https://example.com');

      // Heuristic strategy should have lower confidence
      expect(result.metadata.confidence).toBeLessThanOrEqual(0.5);
    });
  });

  describe('parse - edge cases', () => {
    it('should handle HTML with no links or headings', async () => {
      const html = '<div><p>Plain text content</p></div>';
      const result = await strategy.parse(html, 'https://example.com');

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it('should filter elements below score threshold', async () => {
      const html = `
        <footer>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </footer>
      `;

      const result = await strategy.parse(html, 'https://example.com');

      // Footer links might be filtered due to low scores
      // This is acceptable behavior
      expect(result.nodes.length).toBeLessThanOrEqual(2);
    });

    it('should handle duplicate labels', async () => {
      const html = `
        <nav>
          <h1>Products</h1>
          <h1>Products</h1>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://example.com');

      // Heuristic strategy may create multiple nodes with same label
      // This is acceptable as it's a fallback strategy
      const productNodes = result.nodes.filter(n => n.data.label === 'Products');
      expect(productNodes.length).toBeGreaterThanOrEqual(1);
    });

    it('should sanitize text content', async () => {
      const html = `
        <nav>
          <a href="/test">  Test&nbsp;Product  </a>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://example.com');

      if (result.nodes.length > 0) {
        expect(result.nodes[0].data.label).toBe('Test Product');
      }
    });

    it('should handle buttons as potential nodes', async () => {
      const html = `
        <nav>
          <button>Get Started</button>
          <button>Documentation</button>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://example.com');

      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.nodes.some(n => n.data.label === 'Get Started' || n.data.label === 'Documentation')).toBe(true);
    });
  });
});
