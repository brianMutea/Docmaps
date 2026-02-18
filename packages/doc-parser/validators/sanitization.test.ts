// Unit tests for sanitization validator

import { describe, it, expect } from 'vitest';
import { sanitizeNode, sanitizeNodes, removeDangerousContent, isNodeSafe } from './sanitization';
import type { ExtractedNode } from '../types';

describe('sanitizeNode', () => {
  it('should clean HTML entities in label', () => {
    const node: ExtractedNode = {
      id: 'node-1',
      type: 'product',
      data: { label: 'Test&nbsp;Product&amp;Service' },
      level: 1,
    };

    const result = sanitizeNode(node);

    expect(result.data.label).toBe('Test Product&Service');
  });

  it('should truncate long descriptions', () => {
    const longDesc = 'A'.repeat(300);
    const node: ExtractedNode = {
      id: 'node-1',
      type: 'product',
      data: {
        label: 'Product',
        description: longDesc,
      },
      level: 1,
    };

    const result = sanitizeNode(node);

    // truncateDescription adds "..." which makes it 203 chars
    expect(result.data.description!.length).toBeLessThanOrEqual(203);
    expect(result.data.description).toContain('...');
  });

  it('should remove invalid URLs', () => {
    const node: ExtractedNode = {
      id: 'node-1',
      type: 'product',
      data: {
        label: 'Product',
        docUrl: 'not-a-url',
      },
      level: 1,
    };

    const result = sanitizeNode(node);

    expect(result.data.docUrl).toBeUndefined();
  });

  it('should keep valid HTTPS URLs', () => {
    const node: ExtractedNode = {
      id: 'node-1',
      type: 'product',
      data: {
        label: 'Product',
        docUrl: 'https://example.com',
      },
      level: 1,
    };

    const result = sanitizeNode(node);

    expect(result.data.docUrl).toBe('https://example.com');
  });

  it('should clean tags', () => {
    const node: ExtractedNode = {
      id: 'node-1',
      type: 'product',
      data: {
        label: 'Product',
        tags: ['  tag1  ', 'tag&nbsp;2', ''],
      },
      level: 1,
    };

    const result = sanitizeNode(node);

    expect(result.data.tags).toEqual(['tag1', 'tag 2']);
  });

  it('should clean additional links', () => {
    const node: ExtractedNode = {
      id: 'node-1',
      type: 'product',
      data: {
        label: 'Product',
        additionalLinks: [
          { title: '  Link 1  ', url: 'https://example.com' },
          { title: 'Link 2', url: 'invalid-url' },
          { title: '', url: 'https://example.com' },
        ],
      },
      level: 1,
    };

    const result = sanitizeNode(node);

    expect(result.data.additionalLinks).toEqual([
      { title: 'Link 1', url: 'https://example.com' },
    ]);
  });

  it('should trim whitespace', () => {
    const node: ExtractedNode = {
      id: 'node-1',
      type: 'product',
      data: {
        label: '  Product  ',
        description: '  Description  ',
      },
      level: 1,
    };

    const result = sanitizeNode(node);

    expect(result.data.label).toBe('Product');
    expect(result.data.description).toBe('Description');
  });
});

describe('sanitizeNodes', () => {
  it('should sanitize multiple nodes', () => {
    const nodes: ExtractedNode[] = [
      {
        id: 'node-1',
        type: 'product',
        data: { label: '  Product 1  ' },
        level: 1,
      },
      {
        id: 'node-2',
        type: 'product',
        data: { label: '  Product 2  ' },
        level: 1,
      },
    ];

    const result = sanitizeNodes(nodes);

    expect(result[0].data.label).toBe('Product 1');
    expect(result[1].data.label).toBe('Product 2');
  });

  it('should handle empty array', () => {
    const result = sanitizeNodes([]);
    expect(result).toEqual([]);
  });
});

describe('removeDangerousContent', () => {
  it('should remove script tags', () => {
    const text = 'Hello <script>alert("xss")</script> World';
    const result = removeDangerousContent(text);

    expect(result).not.toContain('<script');
    expect(result).toContain('Hello');
    expect(result).toContain('World');
  });

  it('should remove event handlers', () => {
    const text = '<div onclick="alert()">Click</div>';
    const result = removeDangerousContent(text);

    expect(result).not.toContain('onclick');
  });

  it('should remove javascript: URLs', () => {
    const text = '<a href="javascript:alert()">Link</a>';
    const result = removeDangerousContent(text);

    expect(result).not.toContain('javascript:');
  });

  it('should handle multiple dangerous patterns', () => {
    const text = '<script>bad</script><div onclick="bad">text</div>';
    const result = removeDangerousContent(text);

    expect(result).not.toContain('<script');
    expect(result).not.toContain('onclick');
  });
});

describe('isNodeSafe', () => {
  it('should detect unsafe script tags in label', () => {
    const node: ExtractedNode = {
      id: 'node-1',
      type: 'product',
      data: { label: '<script>alert()</script>' },
      level: 1,
    };

    expect(isNodeSafe(node)).toBe(false);
  });

  it('should detect unsafe script tags in description', () => {
    const node: ExtractedNode = {
      id: 'node-1',
      type: 'product',
      data: {
        label: 'Product',
        description: '<script>alert()</script>',
      },
      level: 1,
    };

    expect(isNodeSafe(node)).toBe(false);
  });

  it('should detect javascript: URLs', () => {
    const node: ExtractedNode = {
      id: 'node-1',
      type: 'product',
      data: {
        label: 'Product',
        docUrl: 'javascript:alert()',
      },
      level: 1,
    };

    expect(isNodeSafe(node)).toBe(false);
  });

  it('should pass safe nodes', () => {
    const node: ExtractedNode = {
      id: 'node-1',
      type: 'product',
      data: {
        label: 'Product',
        description: 'Safe description',
        docUrl: 'https://example.com',
      },
      level: 1,
    };

    expect(isNodeSafe(node)).toBe(true);
  });
});
