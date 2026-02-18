// HTML-based parsing strategy for generic documentation sites

import * as cheerio from 'cheerio';
import { BaseStrategy } from './base';
import type { ParseResult, ExtractedNode, ExtractedEdge } from '../types';
import { generateNodeId, sanitizeText } from '../utils';

/**
 * HTML strategy for generic documentation sites
 * Parses navigation elements, heading hierarchy, and breadcrumbs
 */
export class HtmlStrategy extends BaseStrategy {
  readonly name = 'html';

  canHandle(html: string, _url: string): boolean {
    // This strategy can handle any HTML, but should be used as fallback
    // Check for common documentation patterns
    const hasNav = html.includes('<nav') || html.includes('<aside');
    const hasHeadings = html.includes('<h1') || html.includes('<h2');
    return hasNav || hasHeadings;
  }

  async parse(html: string, url: string): Promise<ParseResult> {
    const doc = cheerio.load(html);
    const warnings: string[] = [];
    const nodes: ExtractedNode[] = [];
    const edges: ExtractedEdge[] = [];

    // Try multiple extraction methods
    const navNodes = this.extractFromNavigation(doc);
    const headingNodes = this.extractFromHeadings(doc);
    const breadcrumbNodes = this.extractFromBreadcrumbs(doc);

    // Combine and deduplicate nodes
    const allNodes = [...navNodes, ...headingNodes, ...breadcrumbNodes];
    const nodeMap = new Map<string, ExtractedNode>();
    
    allNodes.forEach(node => {
      if (!nodeMap.has(node.id)) {
        nodeMap.set(node.id, node);
      }
    });

    nodes.push(...nodeMap.values());

    if (nodes.length === 0) {
      warnings.push('No nodes extracted from HTML structure');
    }

    // Extract hierarchy edges
    const hierarchyEdges = this.extractHierarchyEdges(nodes);
    edges.push(...hierarchyEdges);

    // Calculate confidence based on results
    const confidenceScore = this.calculateConfidence(nodes, edges);

    return {
      nodes,
      edges,
      metadata: {
        source_url: url,
        generated_at: new Date().toISOString(),
        strategy: this.name,
        confidence: confidenceScore,
        warnings,
        stats: {
          nodes_extracted: nodes.length,
          nodes_final: nodes.length,
          edges_extracted: edges.length,
          nodes_deduplicated: 0,
          nodes_filtered: 0,
          duration_ms: 0,
        },
      },
    };
  }

  confidence(): number {
    return 0.6; // Medium confidence for generic HTML parsing
  }

  // =====================================================
  // NAVIGATION EXTRACTION
  // =====================================================

  private extractFromNavigation(doc: cheerio.CheerioAPI): ExtractedNode[] {
    const nodes: ExtractedNode[] = [];

    // Find navigation elements
    doc('nav, aside, [role="navigation"]').each((_, navElem) => {
      const $nav = doc(navElem);

      // Extract top-level items (products)
      $nav.find('> ul > li, > div > ul > li').each((_, li) => {
        const $li = doc(li);
        const link = $li.find('> a').first();
        const label = sanitizeText(link.text());

        if (label && label.length >= 3 && label.length <= 100) {
          nodes.push({
            id: generateNodeId(label, 'product'),
            type: 'product',
            data: {
              label,
              docUrl: link.attr('href'),
            },
            level: 1,
            sourceSelector: 'nav > ul > li',
          });

          // Extract nested items (features)
          $li.find('> ul > li').each((_, nestedLi) => {
            const $nestedLi = doc(nestedLi);
            const nestedLink = $nestedLi.find('> a').first();
            const nestedLabel = sanitizeText(nestedLink.text());

            if (nestedLabel && nestedLabel.length >= 3 && nestedLabel.length <= 100) {
              nodes.push({
                id: generateNodeId(nestedLabel, 'feature'),
                type: 'feature',
                data: {
                  label: nestedLabel,
                  docUrl: nestedLink.attr('href'),
                },
                level: 2,
                sourceSelector: 'nav > ul > li > ul > li',
              });

              // Extract deeply nested items (components)
              $nestedLi.find('> ul > li').each((_, deepLi) => {
                const $deepLi = doc(deepLi);
                const deepLink = $deepLi.find('> a').first();
                const deepLabel = sanitizeText(deepLink.text());

                if (deepLabel && deepLabel.length >= 3 && deepLabel.length <= 100) {
                  nodes.push({
                    id: generateNodeId(deepLabel, 'component'),
                    type: 'component',
                    data: {
                      label: deepLabel,
                      docUrl: deepLink.attr('href'),
                    },
                    level: 3,
                    sourceSelector: 'nav > ul > li > ul > li > ul > li',
                  });
                }
              });
            }
          });
        }
      });
    });

    return nodes;
  }

  // =====================================================
  // HEADING EXTRACTION
  // =====================================================

  private extractFromHeadings(doc: cheerio.CheerioAPI): ExtractedNode[] {
    const nodes: ExtractedNode[] = [];

    // Extract H1 as products
    doc('h1').each((_, elem) => {
      const label = sanitizeText(doc(elem).text());
      if (label && label.length >= 3 && label.length <= 100) {
        nodes.push({
          id: generateNodeId(label, 'product'),
          type: 'product',
          data: {
            label,
          },
          level: 1,
          sourceSelector: 'h1',
        });
      }
    });

    // Extract H2 as features
    doc('h2').each((_, elem) => {
      const label = sanitizeText(doc(elem).text());
      if (label && label.length >= 3 && label.length <= 100) {
        nodes.push({
          id: generateNodeId(label, 'feature'),
          type: 'feature',
          data: {
            label,
          },
          level: 2,
          sourceSelector: 'h2',
        });
      }
    });

    // Extract H3 as components
    doc('h3').each((_, elem) => {
      const label = sanitizeText(doc(elem).text());
      if (label && label.length >= 3 && label.length <= 100) {
        nodes.push({
          id: generateNodeId(label, 'component'),
          type: 'component',
          data: {
            label,
          },
          level: 3,
          sourceSelector: 'h3',
        });
      }
    });

    return nodes;
  }

  // =====================================================
  // BREADCRUMB EXTRACTION
  // =====================================================

  private extractFromBreadcrumbs(doc: cheerio.CheerioAPI): ExtractedNode[] {
    const nodes: ExtractedNode[] = [];

    // Find breadcrumb elements
    doc('[aria-label*="readcrumb" i], .breadcrumb, .breadcrumbs').each((_, breadcrumbElem) => {
      const $breadcrumb = doc(breadcrumbElem);
      const items = $breadcrumb.find('a, li');

      items.each((index, item) => {
        const label = sanitizeText(doc(item).text());
        if (label && label.length >= 3 && label.length <= 100) {
          // Determine type based on position
          let type: 'product' | 'feature' | 'component' = 'component';
          let level = 3;

          if (index === 0) {
            type = 'product';
            level = 1;
          } else if (index === 1) {
            type = 'feature';
            level = 2;
          }

          const href = doc(item).attr('href') || doc(item).find('a').attr('href');

          nodes.push({
            id: generateNodeId(label, type),
            type,
            data: {
              label,
              docUrl: href,
            },
            level,
            sourceSelector: 'breadcrumb',
          });
        }
      });
    });

    return nodes;
  }

  // =====================================================
  // EDGE EXTRACTION
  // =====================================================

  private extractHierarchyEdges(nodes: ExtractedNode[]): ExtractedEdge[] {
    const edges: ExtractedEdge[] = [];

    // Group nodes by type
    const products = nodes.filter(n => n.type === 'product');
    const features = nodes.filter(n => n.type === 'feature');
    const components = nodes.filter(n => n.type === 'component');

    // Connect features to first product
    if (products.length > 0) {
      features.forEach(feature => {
        edges.push({
          id: `${products[0].id}-${feature.id}`,
          source: products[0].id,
          target: feature.id,
          type: 'hierarchy',
          confidence: 0.6,
          inferenceMethod: 'hierarchy',
        });
      });

      // Connect components to first feature, or first product if no features
      if (features.length > 0) {
        components.forEach(component => {
          edges.push({
            id: `${features[0].id}-${component.id}`,
            source: features[0].id,
            target: component.id,
            type: 'hierarchy',
            confidence: 0.5,
            inferenceMethod: 'hierarchy',
          });
        });
      } else {
        components.forEach(component => {
          edges.push({
            id: `${products[0].id}-${component.id}`,
            source: products[0].id,
            target: component.id,
            type: 'hierarchy',
            confidence: 0.5,
            inferenceMethod: 'hierarchy',
          });
        });
      }
    }

    return edges;
  }

  // =====================================================
  // CONFIDENCE CALCULATION
  // =====================================================

  private calculateConfidence(nodes: ExtractedNode[], edges: ExtractedEdge[]): number {
    if (nodes.length === 0) {
      return 0.3;
    }

    // Base confidence
    let confidence = 0.5;

    // Increase confidence if we have good structure
    if (edges.length > 0) {
      confidence += 0.1;
    }

    // Increase confidence if we have multiple node types
    const hasProducts = nodes.some(n => n.type === 'product');
    const hasFeatures = nodes.some(n => n.type === 'feature');
    const hasComponents = nodes.some(n => n.type === 'component');

    if (hasProducts && hasFeatures) {
      confidence += 0.05;
    }
    if (hasComponents) {
      confidence += 0.05;
    }

    return Math.min(confidence, 0.7);
  }
}
