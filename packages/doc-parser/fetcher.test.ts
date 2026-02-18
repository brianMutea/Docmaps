// Unit tests for doc-parser fetcher functions

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateUrl, fetchDocumentation } from './fetcher';

describe('validateUrl', () => {
  it('should accept valid HTTPS URLs', () => {
    expect(validateUrl('https://example.com').valid).toBe(true);
    expect(validateUrl('https://docs.aws.amazon.com/lambda').valid).toBe(true);
    expect(validateUrl('https://stripe.com/docs/api').valid).toBe(true);
  });

  it('should reject HTTP URLs', () => {
    const result = validateUrl('http://example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('HTTPS');
  });

  it('should reject non-URL strings', () => {
    const result = validateUrl('not a url');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should reject localhost', () => {
    const result = validateUrl('https://localhost');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should reject loopback IPs', () => {
    const result1 = validateUrl('https://127.0.0.1');
    expect(result1.valid).toBe(false);
    expect(result1.error).toBeTruthy();

    const result2 = validateUrl('https://0.0.0.0');
    expect(result2.valid).toBe(false);
    expect(result2.error).toBeTruthy();
  });

  it('should reject private IP addresses', () => {
    const result1 = validateUrl('https://192.168.1.1');
    expect(result1.valid).toBe(false);
    expect(result1.error).toBeTruthy();

    const result2 = validateUrl('https://10.0.0.1');
    expect(result2.valid).toBe(false);
    expect(result2.error).toBeTruthy();

    const result3 = validateUrl('https://172.16.0.1');
    expect(result3.valid).toBe(false);
    expect(result3.error).toBeTruthy();

    const result4 = validateUrl('https://172.31.255.255');
    expect(result4.valid).toBe(false);
    expect(result4.error).toBeTruthy();
  });

  it('should reject IPv6 localhost', () => {
    const result1 = validateUrl('https://[::1]');
    expect(result1.valid).toBe(false);
    expect(result1.error).toBeTruthy();

    const result2 = validateUrl('https://::1');
    expect(result2.valid).toBe(false);
    expect(result2.error).toBeTruthy();
  });

  it('should reject empty string', () => {
    const result = validateUrl('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should accept URLs with paths and query params', () => {
    expect(validateUrl('https://example.com/path/to/docs?query=value').valid).toBe(true);
    expect(validateUrl('https://example.com/path#anchor').valid).toBe(true);
  });
});

describe('fetchDocumentation', () => {
  // Store original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Reset fetch mock before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  it('should fetch HTML successfully', async () => {
    const mockHtml = '<html><body>Test</body></html>';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'text/html']]),
      text: async () => mockHtml,
    } as any);

    const result = await fetchDocumentation('https://example.com');

    expect(result.url).toBe('https://example.com');
    expect(result.html).toBe(mockHtml);
    expect(result.contentType).toBe('text/html');
    expect(result.statusCode).toBe(200);
  });

  it('should reject invalid URLs', async () => {
    await expect(fetchDocumentation('http://example.com')).rejects.toThrow('Invalid URL');
    await expect(fetchDocumentation('https://localhost')).rejects.toThrow('Invalid URL');
    await expect(fetchDocumentation('https://192.168.1.1')).rejects.toThrow('Invalid URL');
  });

  it('should handle 404 errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as any);

    await expect(fetchDocumentation('https://example.com')).rejects.toThrow('not found (404)');
  });

  it('should handle 403 errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    } as any);

    await expect(fetchDocumentation('https://example.com')).rejects.toThrow('forbidden (403)');
  });

  it('should handle 429 rate limit errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    } as any);

    await expect(fetchDocumentation('https://example.com')).rejects.toThrow('Rate limited (429)');
  });

  it('should handle timeout errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new DOMException('Timeout', 'AbortError'));

    await expect(fetchDocumentation('https://example.com')).rejects.toThrow('timeout');
  });

  it('should handle network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fetch failed'));

    await expect(fetchDocumentation('https://example.com')).rejects.toThrow('Network error');
  });

  it('should follow redirects up to max limit', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount <= 2) {
        return Promise.resolve({
          ok: false,
          status: 302,
          statusText: 'Found',
          headers: new Map([['location', `https://example.com/redirect${callCount}`]]),
        } as any);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'text/html']]),
        text: async () => '<html>Final</html>',
      } as any);
    });

    const result = await fetchDocumentation('https://example.com');
    expect(result.url).toBe('https://example.com/redirect2');
    expect(result.html).toBe('<html>Final</html>');
  });

  it('should reject too many redirects', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 302,
      statusText: 'Found',
      headers: new Map([['location', 'https://example.com/redirect']]),
    } as any);

    await expect(fetchDocumentation('https://example.com')).rejects.toThrow('Too many redirects');
  });

  it('should reject redirect to invalid URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 302,
      statusText: 'Found',
      headers: new Map([['location', 'https://localhost/evil']]),
    } as any);

    await expect(fetchDocumentation('https://example.com')).rejects.toThrow('Redirect URL invalid');
  });

  it('should handle missing Location header in redirect', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 302,
      statusText: 'Found',
      headers: new Map(),
    } as any);

    await expect(fetchDocumentation('https://example.com')).rejects.toThrow('missing Location header');
  });

  it('should set correct headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'text/html']]),
      text: async () => '<html></html>',
    } as any);
    global.fetch = mockFetch;

    await fetchDocumentation('https://example.com');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('DocMaps-Bot'),
          'Accept': expect.stringContaining('text/html'),
        }),
        redirect: 'manual',
      })
    );
  });

  it('should handle relative redirect URLs', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 302,
          statusText: 'Found',
          headers: new Map([['location', '/redirected']]),
        } as any);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'text/html']]),
        text: async () => '<html>Redirected</html>',
      } as any);
    });

    const result = await fetchDocumentation('https://example.com/docs');
    expect(result.url).toBe('https://example.com/redirected');
  });

  it('should handle other HTTP errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as any);

    await expect(fetchDocumentation('https://example.com')).rejects.toThrow('HTTP error 500');
  });

  it('should default content-type if missing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map(),
      text: async () => '<html></html>',
    } as any);

    const result = await fetchDocumentation('https://example.com');
    expect(result.contentType).toBe('text/html');
  });
});
