// Unit tests for doc-parser utility functions

import { describe, it, expect } from 'vitest';
import {
  generateNodeId,
  sanitizeText,
  truncateDescription,
  isValidUrl,
  hashUrl,
  sleep,
} from './utils';

describe('generateNodeId', () => {
  it('should generate ID from label and type', () => {
    expect(generateNodeId('AWS Lambda', 'product')).toBe('product-aws-lambda');
    expect(generateNodeId('API Gateway', 'feature')).toBe('feature-api-gateway');
    expect(generateNodeId('REST API', 'component')).toBe('component-rest-api');
  });

  it('should handle special characters', () => {
    expect(generateNodeId('S3 (Storage)', 'product')).toBe('product-s3-storage');
    expect(generateNodeId('EC2 / Compute', 'product')).toBe('product-ec2-compute');
    expect(generateNodeId('Lambda@Edge', 'feature')).toBe('feature-lambdaedge');
  });

  it('should handle multiple spaces', () => {
    expect(generateNodeId('AWS   Lambda   Functions', 'product')).toBe('product-aws-lambda-functions');
  });

  it('should handle leading/trailing spaces and hyphens', () => {
    expect(generateNodeId('  Lambda  ', 'product')).toBe('product-lambda');
    expect(generateNodeId('---Lambda---', 'product')).toBe('product-lambda');
  });

  it('should handle empty label', () => {
    expect(() => generateNodeId('', 'product')).toThrow('Label must be a non-empty string');
  });

  it('should handle null/undefined label', () => {
    expect(() => generateNodeId(null as any, 'product')).toThrow('Label must be a non-empty string');
    expect(() => generateNodeId(undefined as any, 'product')).toThrow('Label must be a non-empty string');
  });

  it('should handle empty type', () => {
    expect(() => generateNodeId('Lambda', '' as any)).toThrow('Type must be a non-empty string');
  });

  it('should handle null/undefined type', () => {
    expect(() => generateNodeId('Lambda', null as any)).toThrow('Type must be a non-empty string');
    expect(() => generateNodeId('Lambda', undefined as any)).toThrow('Type must be a non-empty string');
  });

  it('should be deterministic', () => {
    const id1 = generateNodeId('AWS Lambda', 'product');
    const id2 = generateNodeId('AWS Lambda', 'product');
    expect(id1).toBe(id2);
  });

  it('should handle unicode characters', () => {
    expect(generateNodeId('Café API', 'feature')).toBe('feature-caf-api');
    expect(generateNodeId('日本語', 'product')).toBe('product-');
  });
});

describe('sanitizeText', () => {
  it('should decode HTML entities', () => {
    expect(sanitizeText('AWS &amp; Lambda')).toBe('AWS & Lambda');
    expect(sanitizeText('&lt;div&gt;')).toBe('<div>');
    expect(sanitizeText('&quot;Hello&quot;')).toBe('"Hello"');
    expect(sanitizeText('&#39;World&#39;')).toBe("'World'");
    expect(sanitizeText('Non&nbsp;breaking')).toBe('Non breaking');
  });

  it('should normalize whitespace', () => {
    expect(sanitizeText('AWS   Lambda   Functions')).toBe('AWS Lambda Functions');
    expect(sanitizeText('  Leading and trailing  ')).toBe('Leading and trailing');
    expect(sanitizeText('Line\n\nBreaks')).toBe('Line Breaks');
    expect(sanitizeText('Tab\t\tSeparated')).toBe('Tab Separated');
  });

  it('should remove control characters', () => {
    expect(sanitizeText('Hello\x00World')).toBe('HelloWorld');
    expect(sanitizeText('Test\x1FString')).toBe('TestString');
  });

  it('should handle empty string', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(sanitizeText(null as any)).toBe('');
    expect(sanitizeText(undefined as any)).toBe('');
  });

  it('should handle non-string input', () => {
    expect(sanitizeText(123 as any)).toBe('');
    expect(sanitizeText({} as any)).toBe('');
  });

  it('should be pure (no side effects)', () => {
    const input = 'AWS &amp; Lambda';
    const result = sanitizeText(input);
    expect(input).toBe('AWS &amp; Lambda'); // Original unchanged
    expect(result).toBe('AWS & Lambda');
  });
});

describe('truncateDescription', () => {
  it('should not truncate short text', () => {
    const short = 'This is a short description.';
    expect(truncateDescription(short, 200)).toBe(short);
  });

  it('should truncate long text', () => {
    const long = 'A'.repeat(300);
    const result = truncateDescription(long, 200);
    expect(result.length).toBeLessThanOrEqual(203); // 200 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  it('should break at word boundaries', () => {
    const text = 'This is a very long description that needs to be truncated at a reasonable word boundary for better readability and user experience in the application interface.';
    const result = truncateDescription(text, 100);
    expect(result.length).toBeLessThanOrEqual(103);
    expect(result.endsWith('...')).toBe(true);
    // Should break at a space, not mid-word
    const withoutEllipsis = result.slice(0, -3);
    expect(withoutEllipsis[withoutEllipsis.length - 1]).not.toBe(' ');
  });

  it('should use default maxLength of 200', () => {
    const long = 'A'.repeat(300);
    const result = truncateDescription(long);
    expect(result.length).toBeLessThanOrEqual(203);
  });

  it('should sanitize text before truncating', () => {
    const text = 'AWS &amp; Lambda '.repeat(50);
    const result = truncateDescription(text, 100);
    expect(result).toContain('AWS & Lambda');
    expect(result.endsWith('...')).toBe(true);
  });

  it('should handle empty string', () => {
    expect(truncateDescription('', 200)).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(truncateDescription(null as any, 200)).toBe('');
    expect(truncateDescription(undefined as any, 200)).toBe('');
  });

  it('should throw error for invalid maxLength', () => {
    expect(() => truncateDescription('test', 0)).toThrow('maxLength must be greater than 0');
    expect(() => truncateDescription('test', -1)).toThrow('maxLength must be greater than 0');
  });

  it('should handle text exactly at maxLength', () => {
    const text = 'A'.repeat(200);
    const result = truncateDescription(text, 200);
    expect(result).toBe(text);
    expect(result.endsWith('...')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('should accept valid HTTPS URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('https://docs.aws.amazon.com/lambda')).toBe(true);
    expect(isValidUrl('https://stripe.com/docs/api')).toBe(true);
  });

  it('should reject HTTP URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(false);
  });

  it('should reject non-URL strings', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
  });

  it('should reject localhost', () => {
    expect(isValidUrl('https://localhost')).toBe(false);
    expect(isValidUrl('https://localhost:3000')).toBe(false);
  });

  it('should reject private IP addresses', () => {
    expect(isValidUrl('https://127.0.0.1')).toBe(false);
    expect(isValidUrl('https://0.0.0.0')).toBe(false);
    expect(isValidUrl('https://192.168.1.1')).toBe(false);
    expect(isValidUrl('https://10.0.0.1')).toBe(false);
    expect(isValidUrl('https://172.16.0.1')).toBe(false);
    expect(isValidUrl('https://172.31.255.255')).toBe(false);
  });

  it('should reject IPv6 localhost', () => {
    expect(isValidUrl('https://[::1]')).toBe(false);
    expect(isValidUrl('https://::1')).toBe(false);
  });

  it('should reject empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('should reject null/undefined', () => {
    expect(isValidUrl(null as any)).toBe(false);
    expect(isValidUrl(undefined as any)).toBe(false);
  });

  it('should reject URLs without hostname', () => {
    expect(isValidUrl('https://')).toBe(false);
  });

  it('should accept URLs with paths and query params', () => {
    expect(isValidUrl('https://example.com/path/to/docs?query=value')).toBe(true);
    expect(isValidUrl('https://example.com/path#anchor')).toBe(true);
  });
});

describe('hashUrl', () => {
  it('should generate hash for URL', () => {
    const hash = hashUrl('https://example.com');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should be deterministic', () => {
    const url = 'https://docs.aws.amazon.com/lambda';
    const hash1 = hashUrl(url);
    const hash2 = hashUrl(url);
    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different URLs', () => {
    const hash1 = hashUrl('https://example.com/page1');
    const hash2 = hashUrl('https://example.com/page2');
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty string', () => {
    expect(() => hashUrl('')).toThrow('URL must be a non-empty string');
  });

  it('should handle null/undefined', () => {
    expect(() => hashUrl(null as any)).toThrow('URL must be a non-empty string');
    expect(() => hashUrl(undefined as any)).toThrow('URL must be a non-empty string');
  });

  it('should generate hex string', () => {
    const hash = hashUrl('https://example.com');
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it('should be pure (no side effects)', () => {
    const url = 'https://example.com';
    const hash = hashUrl(url);
    expect(url).toBe('https://example.com'); // Original unchanged
    expect(typeof hash).toBe('string');
  });
});

describe('sleep', () => {
  it('should resolve after specified time', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some tolerance
    expect(elapsed).toBeLessThan(100);
  });

  it('should resolve immediately for 0ms', async () => {
    const start = Date.now();
    await sleep(0);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50); // Increased tolerance for CI environments
  });

  it('should throw error for negative duration', () => {
    expect(() => sleep(-1)).toThrow('Sleep duration must be a non-negative number');
  });

  it('should throw error for non-number duration', () => {
    expect(() => sleep('100' as any)).toThrow('Sleep duration must be a non-negative number');
    expect(() => sleep(null as any)).toThrow('Sleep duration must be a non-negative number');
    expect(() => sleep(undefined as any)).toThrow('Sleep duration must be a non-negative number');
  });

  it('should return a Promise', () => {
    const result = sleep(10);
    expect(result).toBeInstanceOf(Promise);
  });
});
