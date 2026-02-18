// Deep crawling strategy - fetches multiple pages to build comprehensive map
// Extracts real product features by analyzing section pages

import * as cheerio from 'cheerio';
import type { ExtractedNode, ExtractedEdge, FetchResult } from '../types';
import { generateNodeId, sanitizeText } from '../utils';

export interface DeepCrawlResult {
  nodes: ExtractedNode[];
  edges: ExtractedEdge[];
  confidence: number;
  pagesCrawled: number;
}

interface PageToFetch {
  url: string;
  label: string;
  parentId: string | null;
  depth: number;
}

/**
 * Deep crawl documentation to extract comprehensive feature map
 * Fetches multiple pages to get real product features
 * 
 * @param fetchFn - Function to fetch URLs (should use browser for JS sites)
 * @param startUrl - Starting documentation URL
 * @param maxPages - Maximum pages to crawl (default: 5)
 */
export async function deepCrawl(
  fetchFn: (url: string) => Promise<FetchResult>,
  startUrl: string,
  maxPages: number = 5
): Promise<DeepCrawlResult> {
  const nodes: ExtractedNode[] = [];
  const edges: ExtractedEdge[] = [];
  const seenLabels = new Set<string>();
  const seenUrls = new Set<string>();
  const pagesToFetch: PageToFetch[] = [];
  
  // Fetch initial page
  console.log(`[DeepCrawl] Fetching start page: ${startUrl}`);
  const startPage = await fetchFn(startUrl);
  seenUrls.add(startUrl);
  
  const $ = cheerio.load(startPage.html);
  
  // Extract site title for root node
  let siteTitle = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content') ||
                  new URL(startUrl).hostname;
  
  siteTitle = siteTitle
    .replace(/\s*\|\s*.*$/, '')
    .replace(/\s*-\s*.*$/, '')
    .replace(/GitHub$/i, '')
    .replace(/Documentation$/i, '')
    .replace(/Docs$/i, '')
    .trim();
  
  const rootId = generateNodeId(siteTitle, 'product');
  nodes.push({
    id: rootId,
    type: 'product',
    data: {
      label: sanitizeText(siteTitle),
      description: $('meta[name="description"]').attr('content') || '',
    },
  });
  seenLabels.add(siteTitle.toLowerCase());
  
  // Collect ALL links on the page
  const allLinks = $('a[href]');
  console.log(`[DeepCrawl] Found ${allLinks.length} total links on start page`);
  
  // Filter to get documentation section links
  const sectionLinks: Array<{ label: string; href: string; score: number }> = [];
  
  allLinks.each((_, link) => {
    const $link = $(link);
    const label = $link.text().trim();
    const href = $link.attr('href') || '';
    
    // Skip if no meaningful label
    if (!label || label.length < 3 || label.length > 80) return;
    
    // Skip external links
    if (href.startsWith('http') && !href.includes(new URL(startUrl).hostname)) return;
    
    // Skip anchor links
    if (href.includes('#')) return;
    
    // Skip non-documentation URLs
    if (
      href.includes('/signup') ||
      href.includes('/login') ||
      href.includes('/pricing') ||
      href.includes('/blog') ||
      href.includes('/changelog') ||
      href === '/' ||
      (!href.includes('/docs') && !href.includes('/api') && !href.includes('/guide') && !href.includes('/reference'))
    ) {
      return;
    }
    
    // Skip common meta/utility links
    const lowerLabel = label.toLowerCase();
    if (
      lowerLabel.includes('edit') ||
      lowerLabel.includes('github') ||
      lowerLabel === 'home' ||
      lowerLabel === 'welcome' ||
      lowerLabel.includes('dashboard') ||
      lowerLabel.includes('sign in') ||
      lowerLabel.includes('sign up') ||
      lowerLabel.includes('login') ||
      lowerLabel.includes('home page') ||
      lowerLabel.includes('changelog')
    ) {
      return;
    }
    
    // Clean up label - remove extra text
    const cleanLabel = label
      .replace(/\s*→.*$/, '') // Remove arrows and text after
      .replace(/\s*\(.*?\).*$/, '') // Remove parentheses and text after
      .replace(/Learn more.*$/i, '')
      .replace(/Explore more.*$/i, '')
      .replace(/Manage your.*$/i, '')
      .replace(/Quickly build.*$/i, '')
      .trim();
    
    if (!cleanLabel || cleanLabel.length < 3) return;
    
    // Calculate score based on how likely this is a main section
    let score = 0;
    const lowerCleanLabel = cleanLabel.toLowerCase();
    
    // Higher score for links that look like main sections
    if (lowerCleanLabel.includes('api')) score += 5;
    if (lowerCleanLabel.includes('reference')) score += 4;
    if (lowerCleanLabel.includes('guide')) score += 3;
    if (lowerCleanLabel.includes('integration')) score += 3;
    if (lowerCleanLabel.includes('configuration')) score += 2;
    if (lowerCleanLabel.includes('deployment')) score += 2;
    if (lowerCleanLabel.includes('authentication')) score += 2;
    if (lowerCleanLabel.includes('overview')) score += 1;
    
    // Penalize very generic terms
    if (lowerCleanLabel === 'documentation') score -= 10;
    if (lowerCleanLabel === 'docs') score -= 10;
    if (lowerCleanLabel === 'introduction') score -= 3;
    if (lowerCleanLabel === 'getting started') score -= 2;
    if (lowerCleanLabel.includes('home page')) score -= 10;
    
    // Prefer links with specific feature names (2-4 words)
    const wordCount = cleanLabel.split(/\s+/).length;
    if (wordCount >= 2 && wordCount <= 4) score += 2;
    if (wordCount === 1) score -= 1; // Single words are often too generic
    if (wordCount > 6) score -= 2; // Too long, probably has extra text
    
    sectionLinks.push({ label: cleanLabel, href, score });
  });
  
  // Sort by score and take top candidates
  sectionLinks.sort((a, b) => b.score - a.score);
  const topSections = sectionLinks.slice(0, maxPages - 1);
  
  console.log(`[DeepCrawl] Identified ${topSections.length} potential section pages:`);
  topSections.forEach(s => console.log(`  - ${s.label} (score: ${s.score})`));
  
  // Queue section pages for crawling
  topSections.forEach(section => {
    const fullUrl = section.href.startsWith('http') 
      ? section.href 
      : new URL(section.href, startUrl).toString();
    
    if (seenUrls.has(fullUrl) || fullUrl === startUrl) return;
    
    pagesToFetch.push({
      url: fullUrl,
      label: sanitizeText(section.label),
      parentId: rootId,
      depth: 1,
    });
    
    seenUrls.add(fullUrl);
  });
  
  console.log(`[DeepCrawl] Queued ${pagesToFetch.length} pages to crawl`);
  
  // Crawl each section page
  let pagesCrawled = 1; // Start page already crawled
  
  for (const page of pagesToFetch) {
    try {
      console.log(`[DeepCrawl] Fetching: ${page.label} (${page.url})`);
      const pageResult = await fetchFn(page.url);
      pagesCrawled++;
      
      const page$ = cheerio.load(pageResult.html);
      
      // Create a feature node for this section
      const sectionId = generateNodeId(page.label, 'feature');
      nodes.push({
        id: sectionId,
        type: 'feature',
        data: {
          label: page.label,
          description: '',
          docUrl: page.url,
        },
      });
      seenLabels.add(page.label.toLowerCase());
      
      // Connect section to root
      edges.push({
        id: `edge-${rootId}-${sectionId}`,
        source: rootId,
        target: sectionId,
        type: 'hierarchy',
      });
      
      // Extract sub-features from this page
      // Look for h2/h3 headings that represent actual features
      const pageHeadings = page$('h2, h3, h4').filter((_, el) => {
        const text = page$(el).text().trim();
        return text.length > 3 && text.length < 80;
      });
      
      const pageFeatures: string[] = [];
      
      pageHeadings.each((_, heading) => {
        const $heading = page$(heading);
        let featureLabel = $heading.text().trim();
        
        if (!featureLabel || featureLabel.length < 3) return;
        
        featureLabel = sanitizeText(featureLabel);
        const lowerLabel = featureLabel.toLowerCase();
        
        // Skip if already seen
        if (seenLabels.has(lowerLabel)) return;
        
        // Skip generic/meta headings
        if (
          lowerLabel.includes('table of contents') ||
          lowerLabel.includes('on this page') ||
          lowerLabel.includes('related') ||
          lowerLabel.includes('see also') ||
          lowerLabel.includes('next steps') ||
          lowerLabel.includes('prerequisites') ||
          lowerLabel.includes('introduction') ||
          lowerLabel.includes('overview') ||
          lowerLabel.includes('getting started') ||
          lowerLabel.startsWith('step ') ||
          lowerLabel.startsWith('what is') ||
          lowerLabel.startsWith('why ') ||
          /^\d+\./.test(lowerLabel) ||
          lowerLabel.length < 5 // Too short to be meaningful
        ) {
          return;
        }
        
        seenLabels.add(lowerLabel);
        pageFeatures.push(featureLabel);
      });
      
      console.log(`[DeepCrawl]   Found ${pageFeatures.length} sub-features on this page`);
      
      // Create component nodes for each sub-feature found (limit to avoid noise)
      pageFeatures.slice(0, 8).forEach(featureLabel => {
        const featureId = generateNodeId(featureLabel, 'component');
        nodes.push({
          id: featureId,
          type: 'component',
          data: {
            label: featureLabel,
            description: '',
          },
        });
        
        // Connect feature to section
        edges.push({
          id: `edge-${sectionId}-${featureId}`,
          source: sectionId,
          target: featureId,
          type: 'hierarchy',
        });
      });
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`[DeepCrawl] Error fetching ${page.url}:`, error);
      // Continue with other pages
    }
  }
  
  console.log(`[DeepCrawl] Completed: ${pagesCrawled} pages crawled, ${nodes.length} nodes extracted`);
  
  // Calculate confidence based on depth and nodes found
  let confidence = 0;
  if (nodes.length >= 15 && pagesCrawled >= 3) confidence = 0.95;
  else if (nodes.length >= 10 && pagesCrawled >= 2) confidence = 0.85;
  else if (nodes.length >= 5) confidence = 0.7;
  else confidence = 0.5;
  
  return {
    nodes,
    edges,
    confidence,
    pagesCrawled,
  };
}
