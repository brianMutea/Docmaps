// URL fetching and validation for doc-parser package

import type { FetchResult } from './types';
import { isValidUrl } from './utils';

// Blocked domains for SSRF prevention
const BLOCKED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
];

// Private IP ranges (CIDR notation conceptually)
const PRIVATE_IP_PREFIXES = [
  '10.',
  '172.16.',
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
  '192.168.',
];

/**
 * Validate a URL for security and format
 * Checks HTTPS protocol, format validity, and blocks dangerous domains
 * 
 * @param url - URL string to validate
 * @returns Validation result with success flag and optional error message
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  // Use the utility function for basic validation
  if (!isValidUrl(url)) {
    return {
      valid: false,
      error: 'Invalid URL. Must be a valid HTTPS URL.',
    };
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Additional checks beyond isValidUrl
    // Check blocked domains
    if (BLOCKED_DOMAINS.includes(hostname)) {
      return {
        valid: false,
        error: 'URL points to a blocked domain (localhost or loopback).',
      };
    }

    // Check private IP prefixes
    for (const prefix of PRIVATE_IP_PREFIXES) {
      if (hostname.startsWith(prefix)) {
        return {
          valid: false,
          error: 'URL points to a private IP address.',
        };
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to parse URL.',
    };
  }
}

/**
 * Fetch documentation from a URL with security checks and error handling
 * 
 * @param url - Documentation URL to fetch
 * @returns FetchResult with HTML content and metadata
 * @throws Error if fetch fails or URL is invalid
 */
export async function fetchDocumentation(url: string): Promise<FetchResult> {
  // Validate URL first
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid URL');
  }

  let finalUrl = url;
  let redirectCount = 0;
  const maxRedirects = 3;

  // Manual redirect handling to limit redirect count
  while (redirectCount <= maxRedirects) {
    try {
      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'DocMaps-Bot/1.0 (Documentation Parser)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'manual', // Handle redirects manually
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // Handle redirects
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error('Redirect response missing Location header');
        }

        // Resolve relative URLs
        finalUrl = new URL(location, finalUrl).toString();

        // Validate redirect URL
        const redirectValidation = validateUrl(finalUrl);
        if (!redirectValidation.valid) {
          throw new Error(`Redirect URL invalid: ${redirectValidation.error}`);
        }

        redirectCount++;
        if (redirectCount > maxRedirects) {
          throw new Error(`Too many redirects (max ${maxRedirects})`);
        }

        continue; // Follow redirect
      }

      // Handle error status codes
      if (response.status === 404) {
        throw new Error('Documentation not found (404)');
      }

      if (response.status === 403) {
        throw new Error('Access forbidden (403)');
      }

      if (response.status === 429) {
        throw new Error('Rate limited (429)');
      }

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      // Get content type
      const contentType = response.headers.get('content-type') || 'text/html';

      // Read response body
      const html = await response.text();

      return {
        url: finalUrl,
        html,
        contentType,
        statusCode: response.status,
      };
    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          throw new Error('Request timeout after 10 seconds');
        }

        if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
          throw new Error('Network error: Unable to reach the URL');
        }

        // Re-throw our custom errors
        throw error;
      }

      // Unknown error
      throw new Error('Failed to fetch documentation');
    }
  }

  throw new Error(`Too many redirects (max ${maxRedirects})`);
}
