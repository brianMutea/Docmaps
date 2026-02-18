// Unit tests for deduplication validator

import { describe, it, expect } from 'vitest';
import { deduplicateNodes, updateEdgeReferences } from './deduplication';
import type { ExtractedNode, ExtractedEdge } from '../types';

describe('deduplicateNodes', () => {
  it('should detect and merge similar nodes', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'product-api',
        type: 'product',
        data: { label: 'API' },
        level: 1,
      },
      {
        id: 'product-api-2',
        type: 'product',
        data: { label: 'API', description: 'API description' },
        level: 1,
      },
    ];

    const result = deduplicateNodes(nodes);

    expect(result.nodes.length).toBe(1);
    expect(result.nodes[0].data.description).toBe('API description');
  });

  it('should use 85% similarity threshold by default', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'product-api',
        type: 'product',
        data: { label: 'API Service' },
        level: 1,
      },
      {
        id: 'product-api-2',
        type: 'product',
        data: { label: 'API Services' }, // Very similar
        level: 1,
      },
      {
        id: 'product-database',
        type: 'product',
        data: { label: 'Database' }, // Different
        level: 1,
      },
    ];

    const result = deduplicateNodes(nodes);

    expect(result.nodes.length).toBe(2); // API merged, Database separate
  });

  it('should only merge nodes of the same type', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'product-api',
        type: 'product',
        data: { label: 'API' },
        level: 1,
      },
      {
        id: 'feature-api',
        type: 'feature',
        data: { label: 'API' },
        level: 2,
      },
    ];

    const result = deduplicateNodes(nodes);

    expect(result.nodes.length).toBe(2); // Different types, not merged
  });

  it('should keep node with more complete data', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'product-api-1',
        type: 'product',
        data: { label: 'API' },
        level: 1,
      },
      {
        id: 'product-api-2',
        type: 'product',
        data: {
          label: 'API',
          description: 'Full description',
          docUrl: 'https://example.com',
          icon: 'api-icon',
        },
        level: 1,
      },
    ];

    const result = deduplicateNodes(nodes);

    expect(result.nodes.length).toBe(1);
    expect(result.nodes[0].data.description).toBe('Full description');
    expect(result.nodes[0].data.docUrl).toBe('https://example.com');
  });

  it('should combine metadata from both nodes', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'product-api-1',
        type: 'product',
        data: {
          label: 'API',
          tags: ['rest'],
        },
        level: 1,
      },
      {
        id: 'product-api-2',
        type: 'product',
        data: {
          label: 'API',
          tags: ['graphql'],
        },
        level: 1,
      },
    ];

    const result = deduplicateNodes(nodes);

    expect(result.nodes.length).toBe(1);
    expect(result.nodes[0].data.tags).toContain('rest');
    expect(result.nodes[0].data.tags).toContain('graphql');
  });

  it('should create ID mapping for merged nodes', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'product-api-1',
        type: 'product',
        data: { label: 'API' },
        level: 1,
      },
      {
        id: 'product-api-2',
        type: 'product',
        data: { label: 'API' },
        level: 1,
      },
    ];

    const result = deduplicateNodes(nodes);

    expect(result.idMapping.size).toBe(2);
    expect(result.idMapping.get('product-api-1')).toBeDefined();
    expect(result.idMapping.get('product-api-2')).toBeDefined();
  });

  it('should handle custom similarity threshold', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'product-api',
        type: 'product',
        data: { label: 'API' },
        level: 1,
      },
      {
        id: 'product-api-service',
        type: 'product',
        data: { label: 'API Service' },
        level: 1,
      },
    ];

    // With high threshold, should not merge (similarity ~0.27)
    const result1 = deduplicateNodes(nodes, 0.95);
    expect(result1.nodes.length).toBe(2);

    // With very low threshold, should merge
    const result2 = deduplicateNodes(nodes, 0.2);
    expect(result2.nodes.length).toBe(1);
  });

  it('should handle empty array', () => {
    const result = deduplicateNodes([]);
    expect(result.nodes).toEqual([]);
    expect(result.idMapping.size).toBe(0);
  });
});

describe('updateEdgeReferences', () => {
  it('should update edge source and target IDs', () => {
    const edges: ExtractedEdge[] = [
      {
        id: 'edge-1',
        source: 'product-api-1',
        target: 'feature-auth',
        type: 'hierarchy',
      },
    ];

    const idMapping = new Map([
      ['product-api-1', 'product-api'],
      ['product-api-2', 'product-api'],
    ]);

    const result = updateEdgeReferences(edges, idMapping);

    expect(result[0].source).toBe('product-api');
    expect(result[0].target).toBe('feature-auth');
  });

  it('should remove self-referencing edges', () => {
    const edges: ExtractedEdge[] = [
      {
        id: 'edge-1',
        source: 'product-api-1',
        target: 'product-api-2',
        type: 'hierarchy',
      },
    ];

    const idMapping = new Map([
      ['product-api-1', 'product-api'],
      ['product-api-2', 'product-api'],
    ]);

    const result = updateEdgeReferences(edges, idMapping);

    expect(result.length).toBe(0); // Self-referencing edge removed
  });

  it('should remove duplicate edges', () => {
    const edges: ExtractedEdge[] = [
      {
        id: 'edge-1',
        source: 'product-api-1',
        target: 'feature-auth',
        type: 'hierarchy',
      },
      {
        id: 'edge-2',
        source: 'product-api-2',
        target: 'feature-auth',
        type: 'hierarchy',
      },
    ];

    const idMapping = new Map([
      ['product-api-1', 'product-api'],
      ['product-api-2', 'product-api'],
    ]);

    const result = updateEdgeReferences(edges, idMapping);

    expect(result.length).toBe(1); // Duplicate edge removed
  });

  it('should preserve edges with unmapped IDs', () => {
    const edges: ExtractedEdge[] = [
      {
        id: 'edge-1',
        source: 'product-api',
        target: 'feature-auth',
        type: 'hierarchy',
      },
    ];

    const idMapping = new Map();

    const result = updateEdgeReferences(edges, idMapping);

    expect(result.length).toBe(1);
    expect(result[0].source).toBe('product-api');
    expect(result[0].target).toBe('feature-auth');
  });

  it('should handle empty arrays', () => {
    const result = updateEdgeReferences([], new Map());
    expect(result).toEqual([]);
  });
});
