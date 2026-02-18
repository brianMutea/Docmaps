// Navigation-based parsing strategy for modern documentation sites
// Extracts structure from navigation menus and sidebars

import * as cheerio from 'cheerio';
import type { ExtractedNode, ExtractedEdge } from '../types';
import { generateNodeId, sanitizeText } from '../utils';

export interface NavigationParseResult {
  nodes: ExtractedNode[];
  edges: ExtractedEdge[];
  confidence: number;
}

/**
 * Parse documentation by analyzing navigation structure
 * Works well with modern docs built with Mintlify, Docusaurus, Nextra, etc.
 */
export function parseFromNavigation(html: string, baseUrl: string): NavigationParseResult {
  const $ = cheerio.load(html);
  const nodes: ExtractedNode[] = [];
  const edges: ExtractedEdge[] = [];
  
  // Extract site title for root node
  let siteTitle = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content') ||
                  $('h1').first().text().trim() ||
                  new URL(baseUrl).hostname;
  
  // Clean up title - remove common suffixes
  siteTitle = siteTitle
    .replace(/\s*\|\s*.*$/, '') // Remove everything after |
    .replace(/\s*-\s*.*$/, '') // Remove everything after -
    .replace(/\s*–\s*.*$/, '') // Remove everything after –
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
  
  // Find navigation containers
  const navSelectors = [
    'nav',
    '[role="navigation"]',
    'aside',
    '.sidebar',
    '.navigation',
    '.nav-menu',
    '.docs-sidebar',
    '[class*="sidebar"]',
    '[class*="navigation"]',
  ];
  
  let bestNavElement: any = null;
  let maxLinks = 0;
  
  // Find the navigation with the most documentation links
  for (const selector of navSelectors) {
    $(selector).each((_: number, el: any) => {
      const links = $(el).find('a[href*="/docs"], a[href*="/api"], a[href*="/guide"], a[href*="/reference"]');
      if (links.length > maxLinks) {
        maxLinks = links.length;
        bestNavElement = el;
      }
    });
  }
  
  // If no nav found, try to find all doc links on the page
  if (!bestNavElement || maxLinks === 0) {
    bestNavElement = $('body')[0];
  }
  
  const bestNav = $(bestNavElement);
  
  // Blacklist of common UI/meta navigation terms to skip
  const blacklist = [
    'edit this page',
    'edit page',
    'edit on github',
    'view on github',
    'github',
    'contribute',
    'feedback',
    'report issue',
    'report bug',
    'suggest edit',
    'improve this page',
    'star us',
    'follow us',
    'twitter',
    'discord',
    'slack',
    'community',
    'changelog',
    'blog',
    'pricing',
    'login',
    'sign in',
    'sign up',
    'get started',
    'try it',
    'download',
    'install',
    'search',
    'menu',
    'navigation',
    'table of contents',
    'on this page',
    'skip to',
    'back to top',
    'previous',
    'next',
    'home',
    'documentation',
    'docs',
    'how-to',
    'how to',
    'manuals',
    'guides',
    'tutorials',
  ];
  
  // Extract links from navigation
  const seenLabels = new Set<string>();
  const linkNodes: Array<{ id: string; label: string; href: string; level: number }> = [];
  
  if (bestNav) {
    // Find all links that look like documentation
    const docLinks = bestNav.find('a').filter((_, el) => {
      const href = $(el).attr('href') || '';
      return (
        href.includes('/docs') ||
        href.includes('/api') ||
        href.includes('/guide') ||
        href.includes('/reference') ||
        href.includes('/documentation')
      );
    });
    
    docLinks.each((_, link) => {
      const $link = $(link);
      let label = $link.text().trim();
      const href = $link.attr('href') || '';
      
      // Skip empty labels or very long ones
      if (!label || label.length > 100 || label.length < 2) return;
      
      // Clean up label
      label = sanitizeText(label);
      
      // Skip blacklisted terms (exact matches or if the label is ONLY the blacklisted term)
      const lowerLabel = label.toLowerCase();
      const isBlacklisted = blacklist.some(term => {
        // Exact match
        if (lowerLabel === term) return true;
        // Label is just the blacklisted term with minor variations
        if (lowerLabel.replace(/[&\s-]+/g, ' ').trim() === term) return true;
        return false;
      });
      
      if (isBlacklisted) return;
      
      // Skip links that are just icons or single characters
      if (label.length < 3) return;
      
      // Skip links with common meta patterns
      if (
        lowerLabel.startsWith('view ') ||
        lowerLabel.startsWith('edit ') ||
        lowerLabel.startsWith('see ') ||
        lowerLabel.endsWith(' →') ||
        lowerLabel.endsWith(' ↗')
      ) {
        return;
      }
      
      // Skip duplicates
      if (seenLabels.has(label.toLowerCase())) return;
      seenLabels.add(label.toLowerCase());
      
      // Determine node type based on context and content
      let nodeType: 'feature' | 'component' = 'feature';
      
      // Components are usually more specific/technical or API-related
      if (
        href.includes('/api/') ||
        href.includes('/reference/') ||
        href.includes('/sdk/') ||
        lowerLabel.includes(' api') ||
        lowerLabel.includes('api ') ||
        lowerLabel.endsWith('api') ||
        lowerLabel.includes('sdk') ||
        lowerLabel.includes('client') ||
        lowerLabel.includes('library') ||
        lowerLabel.includes('package') ||
        lowerLabel.includes('method') ||
        lowerLabel.includes('function') ||
        lowerLabel.includes('class') ||
        lowerLabel.includes('interface') ||
        lowerLabel.includes('endpoint')
      ) {
        nodeType = 'component';
      }
      
      // Features are broader concepts
      // Look for patterns that indicate high-level features
      if (
        lowerLabel.includes('getting started') ||
        lowerLabel.includes('quickstart') ||
        lowerLabel.includes('introduction') ||
        lowerLabel.includes('overview') ||
        lowerLabel.includes('guide') ||
        lowerLabel.includes('tutorial') ||
        lowerLabel.includes('examples') ||
        lowerLabel.includes('use case') ||
        lowerLabel.includes('integration') ||
        lowerLabel.includes('deployment') ||
        lowerLabel.includes('configuration') ||
        lowerLabel.includes('authentication') ||
        lowerLabel.includes('authorization') ||
        lowerLabel.includes('security') ||
        lowerLabel.includes('monitoring') ||
        lowerLabel.includes('analytics')
      ) {
        nodeType = 'feature';
      }
      
      // Determine hierarchy level based on DOM structure
      const parents = $link.parents('ul, ol, nav, div').length;
      const level = Math.min(parents, 3);
      
      const nodeId = generateNodeId(label, nodeType);
      linkNodes.push({ id: nodeId, label, href, level });
      
      nodes.push({
        id: nodeId,
        type: nodeType,
        data: {
          label,
          description: '',
          docUrl: href.startsWith('http') ? href : new URL(href, baseUrl).toString(),
        },
      });
    });
  }
  
  // Create edges based on hierarchy
  // Group nodes by level and create parent-child relationships
  const nodesByLevel = new Map<number, typeof linkNodes>();
  linkNodes.forEach(node => {
    if (!nodesByLevel.has(node.level)) {
      nodesByLevel.set(node.level, []);
    }
    nodesByLevel.get(node.level)!.push(node);
  });
  
  // Connect root to top-level nodes
  const topLevel = Math.min(...Array.from(nodesByLevel.keys()));
  const topLevelNodes = nodesByLevel.get(topLevel) || [];
  
  topLevelNodes.forEach(node => {
    edges.push({
      id: `edge-${rootId}-${node.id}`,
      source: rootId,
      target: node.id,
      type: 'hierarchy',
    });
  });
  
  // Connect nodes at different levels
  const levels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
  for (let i = 0; i < levels.length - 1; i++) {
    const currentLevel = levels[i];
    const nextLevel = levels[i + 1];
    const currentNodes = nodesByLevel.get(currentLevel) || [];
    const nextNodes = nodesByLevel.get(nextLevel) || [];
    
    // Connect each parent to a few children
    currentNodes.forEach((parent, idx) => {
      const childrenPerParent = Math.ceil(nextNodes.length / currentNodes.length);
      const startIdx = idx * childrenPerParent;
      const endIdx = Math.min(startIdx + childrenPerParent, nextNodes.length);
      
      for (let j = startIdx; j < endIdx; j++) {
        if (nextNodes[j]) {
          edges.push({
            id: `edge-${parent.id}-${nextNodes[j].id}`,
            source: parent.id,
            target: nextNodes[j].id,
            type: 'hierarchy',
          });
        }
      }
    });
  }
  
  // Calculate confidence based on how many nodes we found
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
