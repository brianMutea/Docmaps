// Hybrid parsing strategy - combines navigation + content analysis
// Best for modern documentation sites

import * as cheerio from 'cheerio';
import type { ExtractedNode, ExtractedEdge } from '../types';
import { generateNodeId, sanitizeText } from '../utils';

export interface HybridParseResult {
  nodes: ExtractedNode[];
  edges: ExtractedEdge[];
  confidence: number;
}

/**
 * Parse documentation using hybrid approach:
 * 1. Extract navigation structure for hierarchy
 * 2. Analyze main content for actual features/products
 * 3. Combine both for comprehensive map
 */
export function parseHybrid(html: string, baseUrl: string): HybridParseResult {
  const $ = cheerio.load(html);
  const nodes: ExtractedNode[] = [];
  const edges: ExtractedEdge[] = [];
  const seenLabels = new Set<string>();
  
  // Extract site title for root node
  let siteTitle = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content') ||
                  $('h1').first().text().trim() ||
                  new URL(baseUrl).hostname;
  
  // Clean up title
  siteTitle = siteTitle
    .replace(/\s*\|\s*.*$/, '')
    .replace(/\s*-\s*.*$/, '')
    .replace(/\s*–\s*.*$/, '')
    .replace(/GitHub$/i, '')
    .replace(/Documentation$/i, '')
    .replace(/Docs$/i, '')
    .trim();
  
  // Create root product node
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
  
  // Find main content area
  const mainContent = $('main, [role="main"], article, .content, .main-content, body').first();
  
  // Extract features from main content headings (h2, h3, h4)
  if (mainContent.length > 0) {
    const headings = mainContent.find('h2, h3, h4').filter((_, el) => {
      const text = $(el).text().trim();
      return text.length > 3 && text.length < 100;
    });
    
    headings.each((_, heading) => {
      const $heading = $(heading);
      let label = $heading.text().trim();
      
      if (!label || label.length < 3) return;
      
      label = sanitizeText(label);
      const lowerLabel = label.toLowerCase();
      
      // Skip if already seen
      if (seenLabels.has(lowerLabel)) return;
      
      // Skip common non-feature headings
      if (
        lowerLabel.includes('table of contents') ||
        lowerLabel.includes('on this page') ||
        lowerLabel.includes('related') ||
        lowerLabel.includes('see also') ||
        lowerLabel.includes('next steps') ||
        lowerLabel.startsWith('step ') ||
        /^\d+\./.test(lowerLabel) // Skip numbered steps
      ) {
        return;
      }
      
      seenLabels.add(lowerLabel);
      
      // Determine node type
      const nodeType: 'feature' | 'component' = 
        lowerLabel.includes('api') || 
        lowerLabel.includes('sdk') ||
        lowerLabel.includes('client') ||
        lowerLabel.includes('library')
          ? 'component'
          : 'feature';
      
      const nodeId = generateNodeId(label, nodeType);
      nodes.push({
        id: nodeId,
        type: nodeType,
        data: {
          label,
          description: '',
        },
      });
      
      // Connect to root
      edges.push({
        id: `edge-${rootId}-${nodeId}`,
        source: rootId,
        target: nodeId,
        type: 'hierarchy',
      });
    });
  }
  
  // If still not enough nodes, extract from list items and strong text
  if (nodes.length < 3) {
    const listItems = mainContent.find('li, strong, b, .feature, .item').filter((_, el) => {
      const text = $(el).text().trim();
      return text.length > 5 && text.length < 100;
    });
    
    listItems.slice(0, 15).each((_, el) => {
      let label = $(el).text().trim();
      
      if (!label || label.length < 5) return;
      
      // Extract just the first sentence/phrase
      label = label.split(/[.!?]/)[0].trim();
      if (label.length < 5 || label.length > 100) return;
      
      label = sanitizeText(label);
      const lowerLabel = label.toLowerCase();
      
      if (seenLabels.has(lowerLabel)) return;
      
      // Skip common non-feature text
      if (
        lowerLabel.includes('click') ||
        lowerLabel.includes('read') ||
        lowerLabel.includes('learn') ||
        lowerLabel.includes('more') ||
        lowerLabel.length < 5
      ) {
        return;
      }
      
      seenLabels.add(lowerLabel);
      
      const nodeId = generateNodeId(label, 'feature');
      nodes.push({
        id: nodeId,
        type: 'feature',
        data: {
          label,
          description: '',
        },
      });
      
      edges.push({
        id: `edge-${rootId}-${nodeId}`,
        source: rootId,
        target: nodeId,
        type: 'hierarchy',
      });
    });
  }
  
  // Extract from navigation if we don't have enough nodes
  if (nodes.length < 5) {
    const navSelectors = ['nav', '[role="navigation"]', 'aside', '.sidebar', '.nav', '.menu'];
    let bestNavElement: any = null;
    let maxLinks = 0;
    
    for (const selector of navSelectors) {
      $(selector).each((_: number, el: any) => {
        const links = $(el).find('a');
        if (links.length > maxLinks) {
          maxLinks = links.length;
          bestNavElement = el;
        }
      });
    }
    
    if (bestNavElement) {
      const bestNav = $(bestNavElement);
      const allLinks = bestNav.find('a').filter((_: number, el: any) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        // Accept any link with meaningful text, not just /docs or /api
        return text.length > 2 && text.length < 80 && href.length > 0;
      });
      
      allLinks.slice(0, 25).each((_: number, link: any) => {
        const $link = $(link);
        let label = $link.text().trim();
        const href = $link.attr('href') || '';
        
        if (!label || label.length < 3 || label.length > 80) return;
        
        label = sanitizeText(label);
        const lowerLabel = label.toLowerCase();
        
        if (seenLabels.has(lowerLabel)) return;
        
        // Skip meta navigation
        if (
          lowerLabel.includes('edit') ||
          lowerLabel.includes('github') ||
          lowerLabel === 'home' ||
          lowerLabel === 'docs' ||
          lowerLabel.includes('sign') ||
          lowerLabel.includes('login') ||
          lowerLabel.includes('contact') ||
          lowerLabel.includes('support') ||
          lowerLabel.length < 3
        ) {
          return;
        }
        
        seenLabels.add(lowerLabel);
        
        const nodeType: 'feature' | 'component' = 
          href.includes('/api/') || lowerLabel.includes('api')
            ? 'component'
            : 'feature';
        
        const nodeId = generateNodeId(label, nodeType);
        nodes.push({
          id: nodeId,
          type: nodeType,
          data: {
            label,
            description: '',
            docUrl: href.startsWith('http') ? href : new URL(href, baseUrl).toString(),
          },
        });
        
        edges.push({
          id: `edge-${rootId}-${nodeId}`,
          source: rootId,
          target: nodeId,
          type: 'hierarchy',
        });
      });
    }
  }
  
  // Calculate confidence
  let confidence = 0;
  if (nodes.length >= 10) confidence = 0.9;
  else if (nodes.length >= 5) confidence = 0.7;
  else if (nodes.length >= 3) confidence = 0.5;
  else confidence = 0.3;
  
  return {
    nodes,
    edges,
    confidence,
  };
}
