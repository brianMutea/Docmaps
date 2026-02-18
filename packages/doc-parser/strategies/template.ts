// Template-based parsing strategy for known documentation platforms

import * as cheerio from 'cheerio';
import { BaseStrategy } from './base';
import type { ParseResult, ExtractedNode, ExtractedEdge } from '../types';
import { generateNodeId, sanitizeText, truncateDescription } from '../utils';

/**
 * Platform-specific template configuration
 */
interface PlatformTemplate {
  name: string;
  urlPattern: RegExp;
  selectors: {
    navigation?: string;
    breadcrumbs?: string;
    sidebar?: string;
    mainContent?: string;
  };
  extractors: {
    products: (doc: cheerio.CheerioAPI) => ExtractedNode[];
    features: (doc: cheerio.CheerioAPI, products: ExtractedNode[]) => ExtractedNode[];
  };
}

/**
 * Template strategy for known documentation platforms
 * Uses predefined selectors and extraction rules for high accuracy
 */
export class TemplateStrategy extends BaseStrategy {
  readonly name = 'template';
  private matchedPlatform: string | null = null;

  private templates: PlatformTemplate[] = [
    {
      name: 'aws',
      urlPattern: /https?:\/\/(docs\.)?aws\.amazon\.com/i,
      selectors: {
        navigation: '.awsui-side-navigation, nav[role="navigation"]',
        breadcrumbs: '.awsui-breadcrumbs, nav[aria-label="Breadcrumb"]',
        sidebar: 'aside, .sidebar',
      },
      extractors: {
        products: (doc) => this.extractAWSProducts(doc),
        features: (doc, products) => this.extractAWSFeatures(doc, products),
      },
    },
    {
      name: 'stripe',
      urlPattern: /https?:\/\/(docs\.)?stripe\.com/i,
      selectors: {
        sidebar: '.DocsSidebar, nav.sidebar',
        breadcrumbs: '.DocsBreadcrumbs',
        mainContent: 'main, .main-content',
      },
      extractors: {
        products: (doc) => this.extractStripeProducts(doc),
        features: (doc, products) => this.extractStripeFeatures(doc, products),
      },
    },
    {
      name: 'github',
      urlPattern: /https?:\/\/(docs\.)?github\.com/i,
      selectors: {
        navigation: '.js-navigation, nav[role="navigation"]',
        sidebar: 'aside, .sidebar',
        mainContent: '.markdown-body, main',
      },
      extractors: {
        products: (doc) => this.extractGitHubProducts(doc),
        features: (doc, products) => this.extractGitHubFeatures(doc, products),
      },
    },
  ];

  canHandle(html: string, url: string): boolean {
    const template = this.templates.find((t) => t.urlPattern.test(url));
    if (template) {
      this.matchedPlatform = template.name;
      return true;
    }
    return false;
  }

  async parse(html: string, url: string): Promise<ParseResult> {
    const template = this.templates.find((t) => t.urlPattern.test(url));
    if (!template) {
      throw new Error('No template matched for URL');
    }

    const doc = cheerio.load(html);
    const warnings: string[] = [];

    // Extract products (top-level items)
    const products = template.extractors.products(doc);
    if (products.length === 0) {
      warnings.push('No products found using template selectors');
    }

    // Extract features (second-level items)
    const features = template.extractors.features(doc, products);
    if (features.length === 0) {
      warnings.push('No features found using template selectors');
    }

    const nodes = [...products, ...features];

    // Extract edges (hierarchy relationships)
    const edges = this.extractHierarchyEdges(nodes);

    return {
      nodes,
      edges,
      metadata: {
        source_url: url,
        generated_at: new Date().toISOString(),
        strategy: this.name,
        confidence: this.confidence(),
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
    return 0.9;
  }

  // =====================================================
  // AWS EXTRACTORS
  // =====================================================

  private extractAWSProducts(doc: cheerio.CheerioAPI): ExtractedNode[] {
    const products: ExtractedNode[] = [];
    
    // Try navigation items
    doc('.awsui-side-navigation > ul > li, nav[role="navigation"] > ul > li').each((_, elem) => {
      const $elem = doc(elem);
      const link = $elem.find('a').first();
      const label = sanitizeText(link.text());
      
      if (label && label.length >= 3) {
        products.push({
          id: generateNodeId(label, 'product'),
          type: 'product',
          data: {
            label,
            description: truncateDescription(label, 200),
            docUrl: link.attr('href'),
          },
          level: 1,
          sourceSelector: '.awsui-side-navigation > ul > li',
        });
      }
    });

    return products;
  }

  private extractAWSFeatures(doc: cheerio.CheerioAPI, _products: ExtractedNode[]): ExtractedNode[] {
    const features: ExtractedNode[] = [];
    
    // Try nested navigation items
    doc('.awsui-side-navigation > ul > li > ul > li, nav[role="navigation"] > ul > li > ul > li').each((_, elem) => {
      const $elem = doc(elem);
      const link = $elem.find('a').first();
      const label = sanitizeText(link.text());
      
      if (label && label.length >= 3) {
        features.push({
          id: generateNodeId(label, 'feature'),
          type: 'feature',
          data: {
            label,
            description: truncateDescription(label, 200),
            docUrl: link.attr('href'),
          },
          level: 2,
          sourceSelector: '.awsui-side-navigation > ul > li > ul > li',
        });
      }
    });

    return features;
  }

  // =====================================================
  // STRIPE EXTRACTORS
  // =====================================================

  private extractStripeProducts(doc: cheerio.CheerioAPI): ExtractedNode[] {
    const products: ExtractedNode[] = [];
    
    // Try sidebar sections
    doc('.DocsSidebar > ul > li, nav.sidebar > ul > li').each((_, elem) => {
      const $elem = doc(elem);
      const link = $elem.find('a').first();
      const label = sanitizeText(link.text());
      
      if (label && label.length >= 3) {
        products.push({
          id: generateNodeId(label, 'product'),
          type: 'product',
          data: {
            label,
            description: truncateDescription(label, 200),
            docUrl: link.attr('href'),
          },
          level: 1,
          sourceSelector: '.DocsSidebar > ul > li',
        });
      }
    });

    return products;
  }

  private extractStripeFeatures(doc: cheerio.CheerioAPI, _products: ExtractedNode[]): ExtractedNode[] {
    const features: ExtractedNode[] = [];
    
    // Try nested sidebar items
    doc('.DocsSidebar > ul > li > ul > li, nav.sidebar > ul > li > ul > li').each((_, elem) => {
      const $elem = doc(elem);
      const link = $elem.find('a').first();
      const label = sanitizeText(link.text());
      
      if (label && label.length >= 3) {
        features.push({
          id: generateNodeId(label, 'feature'),
          type: 'feature',
          data: {
            label,
            description: truncateDescription(label, 200),
            docUrl: link.attr('href'),
          },
          level: 2,
          sourceSelector: '.DocsSidebar > ul > li > ul > li',
        });
      }
    });

    return features;
  }

  // =====================================================
  // GITHUB EXTRACTORS
  // =====================================================

  private extractGitHubProducts(doc: cheerio.CheerioAPI): ExtractedNode[] {
    const products: ExtractedNode[] = [];
    
    // Try navigation items
    doc('.js-navigation > ul > li, nav[role="navigation"] > ul > li').each((_, elem) => {
      const $elem = doc(elem);
      const link = $elem.find('a').first();
      const label = sanitizeText(link.text());
      
      if (label && label.length >= 3) {
        products.push({
          id: generateNodeId(label, 'product'),
          type: 'product',
          data: {
            label,
            description: truncateDescription(label, 200),
            docUrl: link.attr('href'),
          },
          level: 1,
          sourceSelector: '.js-navigation > ul > li',
        });
      }
    });

    return products;
  }

  private extractGitHubFeatures(doc: cheerio.CheerioAPI, _products: ExtractedNode[]): ExtractedNode[] {
    const features: ExtractedNode[] = [];
    
    // Try nested navigation items
    doc('.js-navigation > ul > li > ul > li, nav[role="navigation"] > ul > li > ul > li').each((_, elem) => {
      const $elem = doc(elem);
      const link = $elem.find('a').first();
      const label = sanitizeText(link.text());
      
      if (label && label.length >= 3) {
        features.push({
          id: generateNodeId(label, 'feature'),
          type: 'feature',
          data: {
            label,
            description: truncateDescription(label, 200),
            docUrl: link.attr('href'),
          },
          level: 2,
          sourceSelector: '.js-navigation > ul > li > ul > li',
        });
      }
    });

    return features;
  }

  // =====================================================
  // EDGE EXTRACTION
  // =====================================================

  private extractHierarchyEdges(nodes: ExtractedNode[]): ExtractedEdge[] {
    const edges: ExtractedEdge[] = [];
    
    // Create hierarchy edges from products to features
    const products = nodes.filter((n) => n.type === 'product');
    const features = nodes.filter((n) => n.type === 'feature');

    // For simplicity, connect each feature to the first product
    // In a real implementation, we'd use DOM structure to determine parent-child
    if (products.length > 0) {
      features.forEach((feature) => {
        edges.push({
          id: `${products[0].id}-${feature.id}`,
          source: products[0].id,
          target: feature.id,
          type: 'hierarchy',
          confidence: 0.8,
          inferenceMethod: 'hierarchy',
        });
      });
    }

    return edges;
  }
}
