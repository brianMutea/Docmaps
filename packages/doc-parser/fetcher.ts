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
 * Validate that URL is a documentation URL
 * Most documentation URLs contain 'docs' or 'documentation' in the path
 */
export function isDocumentationUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    
    // Check if URL contains documentation indicators
    return (
      path.includes('/docs') ||
      path.includes('/documentation') ||
      path.includes('/api') ||
      path.includes('/reference') ||
      path.includes('/guide') ||
      hostname.startsWith('docs.') ||
      hostname.includes('.docs.')
    );
  } catch {
    return false;
  }
}

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


/**
 * Fetch documentation using headless browser (Puppeteer)
 * This executes JavaScript and gets fully rendered content
 * Works with modern JS frameworks like React, Next.js, Vue, etc.
 * 
 * Uses serverless-compatible Chrome in production (Vercel, AWS Lambda)
 * and local Chrome in development.
 * 
 * @param url - Documentation URL to fetch
 * @returns FetchResult with rendered HTML content
 * @throws Error if fetch fails or URL is invalid
 */
export async function fetchWithBrowser(url: string): Promise<FetchResult> {
  // Validate URL first
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid URL');
  }

  // Check if it's a documentation URL
  if (!isDocumentationUrl(url)) {
    throw new Error('URL does not appear to be a documentation site. Please provide a URL containing /docs, /api, or /documentation');
  }

  let browser;
  try {
    // Detect environment
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    if (isProduction) {
      // Production: Use puppeteer-core with serverless Chrome
      console.log('[Fetcher] Using serverless Chrome for production');
      const puppeteerCore = await import('puppeteer-core');
      const chromium = await import('@sparticuz/chromium');
      
      // Get the executable path
      const execPath = await chromium.default.executablePath();
      console.log('[Fetcher] Chromium executable path:', execPath);
      
      // Launch browser with serverless Chrome
      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        defaultViewport: chromium.default.defaultViewport,
        executablePath: execPath,
        headless: chromium.default.headless,
      });
    } else {
      // Development: Try puppeteer-core with local Chrome, fallback to serverless
      console.log('[Fetcher] Using local Chrome for development');
      const puppeteerCore = await import('puppeteer-core');
      
      // Try to find local Chrome installation
      const possiblePaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
        '/usr/bin/google-chrome', // Linux
        '/usr/bin/chromium-browser', // Linux alternative
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', // Windows 32-bit
      ];
      
      let executablePath: string | undefined;
      
      // Check if any Chrome path exists
      const fs = await import('fs');
      for (const path of possiblePaths) {
        try {
          if (fs.existsSync(path)) {
            executablePath = path;
            console.log(`[Fetcher] Found Chrome at: ${path}`);
            break;
          }
        } catch (e) {
          // Continue checking other paths
        }
      }
      
      // If no local Chrome found, use serverless Chrome even in development
      if (!executablePath) {
        console.log('[Fetcher] No local Chrome found, using serverless Chrome');
        const chromium = await import('@sparticuz/chromium');
        browser = await puppeteerCore.default.launch({
          args: chromium.default.args,
          defaultViewport: chromium.default.defaultViewport,
          executablePath: await chromium.default.executablePath(),
          headless: chromium.default.headless,
        });
      } else {
        browser = await puppeteerCore.default.launch({
          headless: true,
          executablePath,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
          ],
        });
      }
    }

    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('DocMaps-Bot/1.0 (Documentation Parser)');

    // Set timeout
    page.setDefaultTimeout(45000); // 45 seconds

    // Navigate to URL and wait for network to be idle
    await page.goto(url, {
      waitUntil: 'domcontentloaded', // Wait for DOM to be ready (faster than networkidle)
      timeout: 45000,
    });

    // Wait for any dynamic content to load
    // Use a simple delay instead of deprecated waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get the fully rendered HTML
    const html = await page.content();

    // Get final URL (in case of redirects)
    const finalUrl = page.url();

    await browser.close();

    return {
      url: finalUrl,
      html,
      contentType: 'text/html',
      statusCode: 200,
    };
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('Navigation timeout')) {
        throw new Error('Page load timeout after 45 seconds');
      }

      if (error.message.includes('net::ERR')) {
        throw new Error('Network error: Unable to reach the URL');
      }

      if (error.message.includes('Could not find') || error.message.includes('Failed to launch')) {
        throw new Error('Browser launch failed. Chrome may not be installed or accessible.');
      }

      // Re-throw our custom errors
      throw error;
    }

    // Unknown error
    throw new Error('Failed to fetch documentation with browser');
  }
}
