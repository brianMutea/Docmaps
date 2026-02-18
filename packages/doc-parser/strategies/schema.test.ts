// Unit tests for schema strategy

import { describe, it, expect } from 'vitest';
import { SchemaStrategy } from './schema';

describe('SchemaStrategy', () => {
  const strategy = new SchemaStrategy();

  describe('canHandle', () => {
    it('should detect OpenAPI specs', () => {
      const html = '<script type="application/json">{"openapi": "3.0.0"}</script>';
      expect(strategy.canHandle(html, 'https://api.example.com')).toBe(true);
    });

    it('should detect Swagger specs', () => {
      const html = '<script type="application/json">{"swagger": "2.0"}</script>';
      expect(strategy.canHandle(html, 'https://api.example.com')).toBe(true);
    });

    it('should detect sitemap references', () => {
      const html = '<link rel="sitemap" href="/sitemap.xml" />';
      expect(strategy.canHandle(html, 'https://docs.example.com')).toBe(true);
    });

    it('should reject non-schema content', () => {
      const html = '<div>Regular HTML content</div>';
      expect(strategy.canHandle(html, 'https://example.com')).toBe(false);
    });
  });

  describe('confidence', () => {
    it('should return medium-high confidence score', () => {
      expect(strategy.confidence()).toBe(0.8);
    });
  });

  describe('parse - OpenAPI', () => {
    it('should extract API info as product', async () => {
      const openApiSpec = {
        openapi: '3.0.0',
        info: {
          title: 'Pet Store API',
          description: 'A sample API for managing pets',
        },
        paths: {},
      };

      const html = `<script type="application/json">${JSON.stringify(openApiSpec)}</script>`;
      const result = await strategy.parse(html, 'https://api.example.com');

      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.nodes[0].type).toBe('product');
      expect(result.nodes[0].data.label).toBe('Pet Store API');
    });

    it('should extract tags as features', async () => {
      const openApiSpec = {
        openapi: '3.0.0',
        info: { title: 'API' },
        tags: [
          { name: 'Pets', description: 'Pet operations' },
          { name: 'Users', description: 'User operations' },
        ],
        paths: {},
      };

      const html = `<script type="application/json">${JSON.stringify(openApiSpec)}</script>`;
      const result = await strategy.parse(html, 'https://api.example.com');

      const features = result.nodes.filter(n => n.type === 'feature');
      expect(features.length).toBe(2);
      expect(features.some(n => n.data.label === 'Pets')).toBe(true);
      expect(features.some(n => n.data.label === 'Users')).toBe(true);
    });

    it('should extract paths as components', async () => {
      const openApiSpec = {
        openapi: '3.0.0',
        info: { title: 'API' },
        paths: {
          '/pets': {
            get: {
              summary: 'List all pets',
              description: 'Returns a list of pets',
              tags: ['Pets'],
            },
          },
          '/pets/{id}': {
            get: {
              summary: 'Get pet by ID',
              tags: ['Pets'],
            },
          },
        },
      };

      const html = `<script type="application/json">${JSON.stringify(openApiSpec)}</script>`;
      const result = await strategy.parse(html, 'https://api.example.com');

      const components = result.nodes.filter(n => n.type === 'component');
      expect(components.length).toBe(2);
      expect(components.some(n => n.data.label === 'List all pets')).toBe(true);
    });

    it('should create hierarchy edges', async () => {
      const openApiSpec = {
        openapi: '3.0.0',
        info: { title: 'API' },
        tags: [{ name: 'Pets' }],
        paths: {
          '/pets': {
            get: {
              summary: 'List pets',
              tags: ['Pets'],
            },
          },
        },
      };

      const html = `<script type="application/json">${JSON.stringify(openApiSpec)}</script>`;
      const result = await strategy.parse(html, 'https://api.example.com');

      expect(result.edges.length).toBeGreaterThan(0);
      expect(result.edges.every(e => e.type === 'hierarchy')).toBe(true);
    });
  });

  describe('parse - Sitemap', () => {
    it('should extract URLs from page with sitemap reference', async () => {
      const html = `
        <link rel="sitemap" href="/sitemap.xml" />
        <nav>
          <a href="/products">Products</a>
          <a href="/products/api">API</a>
          <a href="/products/api/endpoints">Endpoints</a>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.nodes.some(n => n.data.label === 'Products')).toBe(true);
    });

    it('should infer node types from URL structure', async () => {
      const html = `
        <link rel="sitemap" href="/sitemap.xml" />
        <nav>
          <a href="/products">Products</a>
          <a href="/products/api">API</a>
          <a href="/products/api/endpoints">Endpoints</a>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      const products = result.nodes.filter(n => n.type === 'product');
      const features = result.nodes.filter(n => n.type === 'feature');
      const components = result.nodes.filter(n => n.type === 'component');

      expect(products.length).toBeGreaterThan(0);
      expect(features.length + components.length).toBeGreaterThan(0);
    });
  });

  describe('parse - metadata', () => {
    it('should include generation metadata', async () => {
      const openApiSpec = {
        openapi: '3.0.0',
        info: { title: 'API' },
        paths: {},
      };

      const html = `<script type="application/json">${JSON.stringify(openApiSpec)}</script>`;
      const url = 'https://api.example.com';
      const result = await strategy.parse(html, url);

      expect(result.metadata.source_url).toBe(url);
      expect(result.metadata.strategy).toBe('schema');
      expect(result.metadata.confidence).toBeGreaterThan(0);
      expect(result.metadata.generated_at).toBeDefined();
    });

    it('should include warnings when no nodes extracted', async () => {
      const html = '<script type="application/json">{"openapi": "3.0.0"}</script>';
      const result = await strategy.parse(html, 'https://api.example.com');

      expect(result.metadata.warnings.length).toBeGreaterThan(0);
    });

    it('should adjust confidence based on completeness', async () => {
      const openApiSpec = {
        openapi: '3.0.0',
        info: { title: 'API' },
        tags: [{ name: 'Pets' }],
        paths: {
          '/pets': {
            get: { summary: 'List pets', tags: ['Pets'] },
          },
        },
      };

      const html = `<script type="application/json">${JSON.stringify(openApiSpec)}</script>`;
      const result = await strategy.parse(html, 'https://api.example.com');

      // Should have higher confidence with complete structure
      expect(result.metadata.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('parse - edge cases', () => {
    it('should handle invalid JSON gracefully', async () => {
      const html = '<script type="application/json">{invalid json}</script>';
      const result = await strategy.parse(html, 'https://api.example.com');

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it('should handle missing OpenAPI fields', async () => {
      const openApiSpec = {
        openapi: '3.0.0',
        // Missing info, tags, paths
      };

      const html = `<script type="application/json">${JSON.stringify(openApiSpec)}</script>`;
      const result = await strategy.parse(html, 'https://api.example.com');

      expect(result.nodes).toEqual([]);
    });

    it('should filter short labels', async () => {
      const html = `
        <link rel="sitemap" href="/sitemap.xml" />
        <nav>
          <a href="/a">A</a>
          <a href="/ab">AB</a>
          <a href="/abc">ABC</a>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      // Only "ABC" should be included (length >= 3)
      expect(result.nodes.length).toBe(1);
      expect(result.nodes[0].data.label).toBe('ABC');
    });

    it('should avoid duplicate nodes', async () => {
      const html = `
        <link rel="sitemap" href="/sitemap.xml" />
        <nav>
          <a href="/products">Products</a>
          <a href="/products2">Products</a>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.example.com');

      // Should only have one "Products" node
      const productNodes = result.nodes.filter(n => n.data.label === 'Products');
      expect(productNodes.length).toBe(1);
    });
  });
});
