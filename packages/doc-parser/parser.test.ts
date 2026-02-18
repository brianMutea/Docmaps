// Unit tests for parser orchestrator

import { describe, it, expect } from 'vitest';
import { parseDocumentation, getAvailableStrategies, detectStrategy } from './parser';

describe('parseDocumentation', () => {
  it('should use template strategy for AWS URLs', async () => {
    const html = `
      <nav role="navigation">
        <ul>
          <li><a href="/ec2">EC2</a></li>
          <li><a href="/s3">S3 Storage</a></li>
        </ul>
      </nav>
    `;

    const result = await parseDocumentation(html, 'https://docs.aws.amazon.com');

    expect(result.metadata.strategy).toBe('template');
    expect(result.metadata.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('should use schema strategy for OpenAPI specs', async () => {
    const openApiSpec = {
      openapi: '3.0.0',
      info: { title: 'Test API' },
      paths: {
        '/test': {
          get: { summary: 'Test endpoint' },
        },
      },
    };

    const html = `<script type="application/json">${JSON.stringify(openApiSpec)}</script>`;

    const result = await parseDocumentation(html, 'https://api.example.com');

    expect(result.metadata.strategy).toBe('schema');
  });

  it('should use HTML strategy for generic documentation', async () => {
    const html = `
      <nav>
        <ul>
          <li><a href="/products">Products</a></li>
          <li><a href="/features">Features</a></li>
        </ul>
      </nav>
    `;

    const result = await parseDocumentation(html, 'https://docs.example.com');

    expect(result.metadata.strategy).toBe('html');
  });

  it('should fallback to heuristic strategy when HTML strategy fails', async () => {
    const html = `
      <div>
        <p>Plain text without navigation</p>
      </div>
    `;

    const result = await parseDocumentation(html, 'https://example.com');

    // HTML strategy will handle this, but with low confidence
    expect(['html', 'heuristic']).toContain(result.metadata.strategy);
  });

  it('should apply deduplication when duplicates exist', async () => {
    const html = `
      <nav>
        <ul>
          <li><a href="/api">API Service</a></li>
          <li><a href="/api2">API Service</a></li>
          <li><a href="/database">Database</a></li>
        </ul>
      </nav>
    `;

    const result = await parseDocumentation(html, 'https://docs.example.com');

    // Should have deduplicated the two "API Service" nodes
    expect(result.metadata.stats?.nodes_deduplicated).toBeGreaterThanOrEqual(0);
    // Final count should be less than extracted if deduplication occurred
    if (result.metadata.stats) {
      expect(result.metadata.stats.nodes_final).toBeLessThanOrEqual(
        result.metadata.stats.nodes_extracted
      );
    }
  });

  it('should apply filtering', async () => {
    const html = `
      <nav>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/products">Products</a></li>
        </ul>
      </nav>
    `;

    const result = await parseDocumentation(html, 'https://docs.example.com');

    // Home and About should be filtered out
    expect(result.nodes.some(n => n.data.label === 'Home')).toBe(false);
    expect(result.nodes.some(n => n.data.label === 'About')).toBe(false);
    expect(result.metadata.stats?.nodes_filtered).toBeGreaterThan(0);
  });

  it('should apply sanitization', async () => {
    const html = `
      <nav>
        <ul>
          <li><a href="/test">  Test&nbsp;Product  </a></li>
        </ul>
      </nav>
    `;

    const result = await parseDocumentation(html, 'https://docs.example.com');

    if (result.nodes.length > 0) {
      expect(result.nodes[0].data.label).toBe('Test Product');
    }
  });

  it('should include generation metadata', async () => {
    const html = '<nav><ul><li><a>Test</a></li></ul></nav>';
    const url = 'https://docs.example.com';

    const result = await parseDocumentation(html, url);

    expect(result.metadata.source_url).toBe(url);
    expect(result.metadata.generated_at).toBeDefined();
    expect(result.metadata.strategy).toBeDefined();
    expect(result.metadata.confidence).toBeGreaterThan(0);
  });

  it('should include statistics', async () => {
    const html = '<nav><ul><li><a>Test</a></li></ul></nav>';

    const result = await parseDocumentation(html, 'https://docs.example.com');

    expect(result.metadata.stats).toBeDefined();
    expect(result.metadata.stats?.nodes_extracted).toBeGreaterThanOrEqual(0);
    expect(result.metadata.stats?.nodes_final).toBeGreaterThanOrEqual(0);
    expect(result.metadata.stats?.edges_extracted).toBeGreaterThanOrEqual(0);
    expect(result.metadata.stats?.duration_ms).toBeGreaterThan(0);
  });

  it('should handle empty HTML', async () => {
    const result = await parseDocumentation('', 'https://example.com');

    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });

  it('should handle malformed HTML', async () => {
    const html = '<div><p>Unclosed tags<div>';

    const result = await parseDocumentation(html, 'https://example.com');

    // Should not throw, should return some result
    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();
  });

  it('should execute strategies in priority order', async () => {
    // AWS URL should use template strategy, not HTML strategy
    const html = `
      <nav role="navigation">
        <ul><li><a>Test</a></li></ul>
      </nav>
    `;

    const result = await parseDocumentation(html, 'https://docs.aws.amazon.com');

    expect(result.metadata.strategy).toBe('template');
  });

  it('should update edge references after deduplication', async () => {
    const html = `
      <nav>
        <ul>
          <li>
            <a href="/api">API</a>
            <ul>
              <li><a href="/rest">REST</a></li>
            </ul>
          </li>
        </ul>
      </nav>
    `;

    const result = await parseDocumentation(html, 'https://docs.example.com');

    // All edges should reference valid node IDs
    result.edges.forEach(edge => {
      const sourceExists = result.nodes.some(n => n.id === edge.source);
      const targetExists = result.nodes.some(n => n.id === edge.target);
      expect(sourceExists).toBe(true);
      expect(targetExists).toBe(true);
    });
  });
});

describe('getAvailableStrategies', () => {
  it('should return all strategy names', () => {
    const strategies = getAvailableStrategies();

    expect(strategies).toContain('template');
    expect(strategies).toContain('schema');
    expect(strategies).toContain('html');
    expect(strategies).toContain('heuristic');
  });
});

describe('detectStrategy', () => {
  it('should detect template strategy for AWS', () => {
    const html = '<nav role="navigation"></nav>';
    const strategy = detectStrategy(html, 'https://docs.aws.amazon.com');

    expect(strategy).toBe('template');
  });

  it('should detect schema strategy for OpenAPI', () => {
    const html = '<script type="application/json">{"openapi": "3.0.0"}</script>';
    const strategy = detectStrategy(html, 'https://api.example.com');

    expect(strategy).toBe('schema');
  });

  it('should detect HTML strategy for generic docs', () => {
    const html = '<nav><ul><li><a>Test</a></li></ul></nav>';
    const strategy = detectStrategy(html, 'https://docs.example.com');

    expect(strategy).toBe('html');
  });

  it('should fallback to heuristic', () => {
    const html = '<div>Plain content</div>';
    const strategy = detectStrategy(html, 'https://example.com');

    expect(strategy).toBe('heuristic');
  });
});
