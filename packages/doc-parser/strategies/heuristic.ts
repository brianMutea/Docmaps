// Heuristic-based parsing strategy as fallback

import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { BaseStrategy } from './base';
import type { ParseResult, ExtractedNode, ExtractedEdge } from '../types';
import { generateNodeId, sanitizeText } from '../utils';

interface ScoredElement {
  element: Element;
  label: string;
  score: number;
  href?: string;
}

/**
 * Heuristic strategy for extracting nodes using scoring algorithm
 * Used as fallback when other strategies fail
 */
export class HeuristicStrategy extends BaseStrategy {
  readonly name = 'heuristic';

  canHandle(html: string, _url: string): boolean {
    // This strategy can handle any HTML as a last resort
    return html.length > 0;
  }

  async parse(html: string, url: string): Promise<ParseResult> {
    const doc = cheerio.load(html);
    const warnings: string[] = [];

    // Score all potential elements
    const scoredElements = this.scoreElements(doc);

    // Filter and sort by score
    const topElements = scoredElements
      .filter(e => e.score > 0.3) // Minimum threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Limit to top 50

    if (topElements.length === 0) {
      warnings.push('No elements scored above threshold');
    }

    // Convert to nodes
    const nodes = this.elementsToNodes(topElements);

    // Extract edges
    const edges = this.extractHierarchyEdges(nodes);

    // Calculate confidence
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
    return 0.4; // Low confidence for heuristic fallback
  }

  // =====================================================
  // ELEMENT SCORING
  // =====================================================

  private scoreElements(doc: cheerio.CheerioAPI): ScoredElement[] {
    const scored: ScoredElement[] = [];

    // Score links and headings
    doc('a, h1, h2, h3, h4, button').each((_, elem) => {
      const $elem = doc(elem);
      const label = sanitizeText($elem.text());

      // Skip if label is too short or too long
      if (!label || label.length < 3 || label.length > 100) {
        return;
      }

      let score = 0;

      // Position score (top/left elements score higher)
      score += this.scorePosition($elem);

      // Styling score (larger, bolder elements score higher)
      score += this.scoreStyling($elem);

      // Text length score (optimal 50-200 chars)
      score += this.scoreTextLength(label);

      // Link density score (more links = likely navigation)
      score += this.scoreLinkDensity($elem);

      // Element type score
      score += this.scoreElementType(elem.tagName);

      const href = $elem.attr('href');

      scored.push({
        element: elem,
        label,
        score,
        href,
      });
    });

    return scored;
  }

  private scorePosition($elem: cheerio.Cheerio<Element>): number {
    // Elements in nav, aside, header score higher
    if ($elem.closest('nav, aside, header').length > 0) {
      return 0.3;
    }

    // Elements in main content score medium
    if ($elem.closest('main, article').length > 0) {
      return 0.2;
    }

    // Elements in footer score lower
    if ($elem.closest('footer').length > 0) {
      return 0.05;
    }

    return 0.1;
  }

  private scoreStyling($elem: cheerio.Cheerio<Element>): number {
    let score = 0;

    // Check for bold/strong
    if ($elem.is('strong, b') || $elem.closest('strong, b').length > 0) {
      score += 0.1;
    }

    // Check for heading tags
    const tagName = $elem.prop('tagName')?.toLowerCase();
    if (tagName === 'h1') score += 0.3;
    else if (tagName === 'h2') score += 0.25;
    else if (tagName === 'h3') score += 0.2;
    else if (tagName === 'h4') score += 0.15;

    return score;
  }

  private scoreTextLength(text: string): number {
    const length = text.length;

    // Optimal range: 10-50 characters
    if (length >= 10 && length <= 50) {
      return 0.3;
    }

    // Acceptable range: 5-100 characters
    if (length >= 5 && length <= 100) {
      return 0.2;
    }

    // Too short or too long
    return 0.05;
  }

  private scoreLinkDensity($elem: cheerio.Cheerio<Element>): number {
    // If element is a link itself
    if ($elem.is('a')) {
      return 0.2;
    }

    // If element contains links
    const links = $elem.find('a').length;
    if (links > 0) {
      return Math.min(0.2, links * 0.05);
    }

    return 0;
  }

  private scoreElementType(tagName: string): number {
    const tag = tagName.toLowerCase();

    if (tag === 'h1') return 0.3;
    if (tag === 'h2') return 0.25;
    if (tag === 'h3') return 0.2;
    if (tag === 'a') return 0.15;
    if (tag === 'button') return 0.1;

    return 0.05;
  }

  // =====================================================
  // NODE CONVERSION
  // =====================================================

  private elementsToNodes(elements: ScoredElement[]): ExtractedNode[] {
    const nodes: ExtractedNode[] = [];
    const nodeMap = new Map<string, ExtractedNode>();

    // Assign types based on score ranking
    elements.forEach((elem, index) => {
      let type: 'product' | 'feature' | 'component' = 'component';
      let level = 3;

      // Top 20% are products
      if (index < elements.length * 0.2) {
        type = 'product';
        level = 1;
      }
      // Next 30% are features
      else if (index < elements.length * 0.5) {
        type = 'feature';
        level = 2;
      }
      // Rest are components

      const nodeId = generateNodeId(elem.label, type);

      // Avoid duplicates
      if (!nodeMap.has(nodeId)) {
        const node: ExtractedNode = {
          id: nodeId,
          type,
          data: {
            label: elem.label,
            docUrl: elem.href,
          },
          level,
          sourceSelector: 'heuristic',
        };

        nodeMap.set(nodeId, node);
        nodes.push(node);
      }
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
          confidence: 0.4,
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
            confidence: 0.3,
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
            confidence: 0.3,
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
      return 0.2;
    }

    // Base confidence
    let confidence = 0.3;

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

    return Math.min(confidence, 0.5);
  }
}
