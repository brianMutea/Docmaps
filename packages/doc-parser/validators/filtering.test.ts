// Unit tests for filtering validator

import { describe, it, expect } from 'vitest';
import { filterNodes, getFilterStats } from './filtering';
import type { ExtractedNode } from '../types';

describe('filterNodes', () => {
  it('should remove nodes with short labels', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'node-1',
        type: 'product',
        data: { label: 'AB' }, // Too short
        level: 1,
      },
      {
        id: 'node-2',
        type: 'product',
        data: { label: 'ABC' }, // Valid
        level: 1,
      },
    ];

    const result = filterNodes(nodes);

    expect(result.length).toBe(1);
    expect(result[0].data.label).toBe('ABC');
  });

  it('should remove nodes with long labels', () => {
    const longLabel = 'A'.repeat(150);
    const nodes: ExtractedNode[] = [
      {
        id: 'node-1',
        type: 'product',
        data: { label: longLabel }, // Too long
        level: 1,
      },
      {
        id: 'node-2',
        type: 'product',
        data: { label: 'Normal Label' }, // Valid
        level: 1,
      },
    ];

    const result = filterNodes(nodes);

    expect(result.length).toBe(1);
    expect(result[0].data.label).toBe('Normal Label');
  });

  it('should remove excluded navigation labels', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'node-1',
        type: 'product',
        data: { label: 'Home' },
        level: 1,
      },
      {
        id: 'node-2',
        type: 'product',
        data: { label: 'About' },
        level: 1,
      },
      {
        id: 'node-3',
        type: 'product',
        data: { label: 'Products' },
        level: 1,
      },
    ];

    const result = filterNodes(nodes);

    expect(result.length).toBe(1);
    expect(result[0].data.label).toBe('Products');
  });

  it('should be case-insensitive for excluded labels', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'node-1',
        type: 'product',
        data: { label: 'HOME' },
        level: 1,
      },
      {
        id: 'node-2',
        type: 'product',
        data: { label: 'Home' },
        level: 1,
      },
      {
        id: 'node-3',
        type: 'product',
        data: { label: 'home' },
        level: 1,
      },
    ];

    const result = filterNodes(nodes);

    expect(result.length).toBe(0);
  });

  it('should limit nodes to max count', () => {
    const nodes: ExtractedNode[] = Array.from({ length: 100 }, (_, i) => ({
      id: `node-${i}`,
      type: 'product' as const,
      data: { label: `Product ${i}` },
      level: 1,
    }));

    const result = filterNodes(nodes, { maxNodes: 50 });

    expect(result.length).toBe(50);
  });

  it('should prioritize products over features over components', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'component-1',
        type: 'component',
        data: { label: 'Component' },
        level: 3,
      },
      {
        id: 'feature-1',
        type: 'feature',
        data: { label: 'Feature' },
        level: 2,
      },
      {
        id: 'product-1',
        type: 'product',
        data: { label: 'Product' },
        level: 1,
      },
    ];

    const result = filterNodes(nodes, { maxNodes: 2 });

    expect(result.length).toBe(2);
    expect(result.some(n => n.type === 'product')).toBe(true);
    expect(result.some(n => n.type === 'feature')).toBe(true);
    expect(result.some(n => n.type === 'component')).toBe(false);
  });

  it('should prioritize nodes with more complete data', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'node-1',
        type: 'product',
        data: { label: 'Product 1' },
        level: 1,
      },
      {
        id: 'node-2',
        type: 'product',
        data: {
          label: 'Product 2',
          description: 'Full description',
          docUrl: 'https://example.com',
          icon: 'icon',
        },
        level: 1,
      },
    ];

    const result = filterNodes(nodes, { maxNodes: 1 });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('node-2');
  });

  it('should filter nodes without descriptions when required', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'node-1',
        type: 'product',
        data: { label: 'Product 1' },
        level: 1,
      },
      {
        id: 'node-2',
        type: 'product',
        data: {
          label: 'Product 2',
          description: 'Has description',
        },
        level: 1,
      },
    ];

    const result = filterNodes(nodes, { requireDescription: true });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe('node-2');
  });

  it('should accept custom excluded labels', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'node-1',
        type: 'product',
        data: { label: 'Custom' },
        level: 1,
      },
      {
        id: 'node-2',
        type: 'product',
        data: { label: 'Product' },
        level: 1,
      },
    ];

    const result = filterNodes(nodes, { excludedLabels: ['custom'] });

    expect(result.length).toBe(1);
    expect(result[0].data.label).toBe('Product');
  });

  it('should accept custom length limits', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'node-1',
        type: 'product',
        data: { label: 'AB' },
        level: 1,
      },
      {
        id: 'node-2',
        type: 'product',
        data: { label: 'ABC' },
        level: 1,
      },
    ];

    const result = filterNodes(nodes, { minLabelLength: 2, maxLabelLength: 2 });

    expect(result.length).toBe(1);
    expect(result[0].data.label).toBe('AB');
  });

  it('should handle empty array', () => {
    const result = filterNodes([]);
    expect(result).toEqual([]);
  });
});

describe('getFilterStats', () => {
  it('should calculate filter statistics', () => {
    const stats = getFilterStats(100, 50);

    expect(stats.original).toBe(100);
    expect(stats.filtered).toBe(50);
    expect(stats.removed).toBe(50);
    expect(stats.removalRate).toBe(0.5);
  });

  it('should handle zero original count', () => {
    const stats = getFilterStats(0, 0);

    expect(stats.removalRate).toBe(0);
  });

  it('should handle no removals', () => {
    const stats = getFilterStats(50, 50);

    expect(stats.removed).toBe(0);
    expect(stats.removalRate).toBe(0);
  });
});
