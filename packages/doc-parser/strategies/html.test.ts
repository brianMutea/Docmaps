// Unit tests for HTML strategy

import { describe, it, expect } from 'vitest';
import { HtmlStrategy } from './html';

describe('HtmlStrategy', () => {
  const strategy = new HtmlStrategy();

  describe('canHandle', () => {
    it('should detect HTML with navigation', () => {
      const html = '<nav><ul><li>Item</li></ul></nav>';
      expect(strategy.canHandle(html, 'https://docs.example.com')).toBe(true);
    });

    it('should detect HTML with aside', () => {
      const html = '<aside><ul><li>Item</li></ul></aside>';
      expect(strategy.canHandle(html, 'https://docs.example.com')).toBe(true);
    });

    it('should detect HTML with headings', () => {
      const html = '<h1>Title</h1><h2>Subtitle</h2>';
      expect(strategy.canHandle(html, 'https://docs.example.com')).toBe(true);
    });

    it('should reject HTML without structure', () => {
      const html = '<div>Plain text</div>';
      expect(strategy.canHandle(html, 'https://docs.example.com')).toBe(false);
    });
  });

  describe('confidence', () => {
    it('should return medium confidence score', () => {
      expect(strategy.confidence()).toBe(0.6);
    });
  });

  describe('parse - navigation', () => {
    it('should extract products from top-level nav items', async () => {
      const html = `
        <nav>
          <ul>
            <li><a href="/products">Products</a></li>
            <li><a href="/services">Services</a></li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      const products = result.nodes.filter(n => n.type === 'product');
      expect(products.length).toBe(2);
      expect(products.some(n => n.data.label === 'Products')).toBe(true);
      expect(products.some(n => n.data.label === 'Services')).toBe(true);
    });

    it('should extract features from nested nav items', async () => {
      const html = `
        <nav>
          <ul>
            <li>
              <a href="/products">Products</a>
              <ul>
                <li><a href="/products/api">API</a></li>
                <li><a href="/products/sdk">SDK</a></li>
              </ul>
            </li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      const features = result.nodes.filter(n => n.type === 'feature');
      expect(features.length).toBe(2);
      expect(features.some(n => n.data.label === 'API')).toBe(true);
      expect(features.some(n => n.data.label === 'SDK')).toBe(true);
    });

    it('should extract components from deeply nested nav items', async () => {
      const html = `
        <nav>
          <ul>
            <li>
              <a href="/products">Products</a>
              <ul>
                <li>
                  <a href="/products/api">API</a>
                  <ul>
                    <li><a href="/products/api/rest">REST</a></li>
                    <li><a href="/products/api/graphql">GraphQL</a></li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      const components = result.nodes.filter(n => n.type === 'component');
      expect(components.length).toBe(2);
      expect(components.some(n => n.data.label === 'REST')).toBe(true);
      expect(components.some(n => n.data.label === 'GraphQL')).toBe(true);
    });
  });

  describe('parse - headings', () => {
    it('should extract products from H1', async () => {
      const html = `
        <h1>Main Product</h1>
        <h1>Another Product</h1>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      const products = result.nodes.filter(n => n.type === 'product');
      expect(products.length).toBe(2);
      expect(products.some(n => n.data.label === 'Main Product')).toBe(true);
    });

    it('should extract features from H2', async () => {
      const html = `
        <h1>Product</h1>
        <h2>Feature One</h2>
        <h2>Feature Two</h2>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      const features = result.nodes.filter(n => n.type === 'feature');
      expect(features.length).toBe(2);
      expect(features.some(n => n.data.label === 'Feature One')).toBe(true);
    });

    it('should extract components from H3', async () => {
      const html = `
        <h1>Product</h1>
        <h2>Feature</h2>
        <h3>Component One</h3>
        <h3>Component Two</h3>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      const components = result.nodes.filter(n => n.type === 'component');
      expect(components.length).toBe(2);
      expect(components.some(n => n.data.label === 'Component One')).toBe(true);
    });
  });

  describe('parse - breadcrumbs', () => {
    it('should extract nodes from breadcrumbs', async () => {
      const html = `
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a>
          <a href="/docs">Documentation</a>
          <a href="/docs/api">API Reference</a>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.nodes.some(n => n.data.label === 'Home')).toBe(true);
      expect(result.nodes.some(n => n.data.label === 'Documentation')).toBe(true);
    });

    it('should infer types from breadcrumb position', async () => {
      const html = `
        <div class="breadcrumb">
          <a href="/">Products</a>
          <a href="/api">API</a>
          <a href="/api/rest">REST</a>
        </div>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      const products = result.nodes.filter(n => n.type === 'product' && n.data.label === 'Products');
      const features = result.nodes.filter(n => n.type === 'feature' && n.data.label === 'API');
      const components = result.nodes.filter(n => n.type === 'component' && n.data.label === 'REST');

      expect(products.length).toBe(1);
      expect(features.length).toBe(1);
      expect(components.length).toBe(1);
    });
  });

  describe('parse - edges', () => {
    it('should create hierarchy edges', async () => {
      const html = `
        <nav>
          <ul>
            <li>
              <a href="/products">Products</a>
              <ul>
                <li><a href="/products/api">API</a></li>
              </ul>
            </li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      expect(result.edges.length).toBeGreaterThan(0);
      expect(result.edges.every(e => e.type === 'hierarchy')).toBe(true);
    });

    it('should connect features to products', async () => {
      const html = `
        <h1>Product</h1>
        <h2>Feature</h2>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      const productNode = result.nodes.find(n => n.type === 'product');
      const featureNode = result.nodes.find(n => n.type === 'feature');

      expect(productNode).toBeDefined();
      expect(featureNode).toBeDefined();

      const edge = result.edges.find(e => 
        e.source === productNode?.id && e.target === featureNode?.id
      );
      expect(edge).toBeDefined();
    });
  });

  describe('parse - metadata', () => {
    it('should include generation metadata', async () => {
      const html = '<nav><ul><li><a>Test</a></li></ul></nav>';
      const url = 'https://docs.example.com';

      const result = await strategy.parse(html, url);

      expect(result.metadata.source_url).toBe(url);
      expect(result.metadata.strategy).toBe('html');
      expect(result.metadata.confidence).toBeGreaterThan(0);
      expect(result.metadata.generated_at).toBeDefined();
    });

    it('should include warnings when no nodes found', async () => {
      const html = '<div>No structure</div>';
      const result = await strategy.parse(html, 'https://docs.example.com');

      expect(result.metadata.warnings.length).toBeGreaterThan(0);
    });

    it('should adjust confidence based on completeness', async () => {
      const html = `
        <nav>
          <ul>
            <li>
              <a href="/products">Products</a>
              <ul>
                <li><a href="/api">API</a></li>
              </ul>
            </li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      // Should have higher confidence with complete structure
      expect(result.metadata.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('parse - edge cases', () => {
    it('should handle empty HTML', async () => {
      const result = await strategy.parse('', 'https://docs.example.com');

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it('should filter short labels', async () => {
      const html = `
        <nav>
          <ul>
            <li><a href="/a">A</a></li>
            <li><a href="/ab">AB</a></li>
            <li><a href="/abc">ABC</a></li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      // Only "ABC" should be included (length >= 3)
      expect(result.nodes.length).toBe(1);
      expect(result.nodes[0].data.label).toBe('ABC');
    });

    it('should filter long labels', async () => {
      const longLabel = 'A'.repeat(150);
      const html = `
        <nav>
          <ul>
            <li><a href="/long">${longLabel}</a></li>
            <li><a href="/normal">Normal Label</a></li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      // Only "Normal Label" should be included (length <= 100)
      expect(result.nodes.length).toBe(1);
      expect(result.nodes[0].data.label).toBe('Normal Label');
    });

    it('should deduplicate nodes from multiple sources', async () => {
      const html = `
        <h1>Products</h1>
        <nav>
          <ul>
            <li><a href="/products">Products</a></li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      // Should only have one "Products" node
      const productNodes = result.nodes.filter(n => n.data.label === 'Products');
      expect(productNodes.length).toBe(1);
    });

    it('should sanitize text content', async () => {
      const html = `
        <nav>
          <ul>
            <li><a href="/test">  Test&nbsp;Product  </a></li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      expect(result.nodes[0].data.label).toBe('Test Product');
    });
  });
});
