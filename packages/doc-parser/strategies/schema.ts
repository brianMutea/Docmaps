// Schema-based parsing strategy for structured documentation

import * as cheerio from 'cheerio';
import { BaseStrategy } from './base';
import type { ParseResult, ExtractedNode, ExtractedEdge } from '../types';
import { generateNodeId, sanitizeText, truncateDescription } from '../utils';

/**
 * Schema strategy for structured documentation formats
 * Parses OpenAPI/Swagger specs and sitemap.xml references
 */
export class SchemaStrategy extends BaseStrategy {
  readonly name = 'schema';
  private detectedSchemaType: 'openapi' | 'sitemap' | null = null;

  canHandle(html: string, url: string): boolean {
    // Check for OpenAPI/Swagger JSON in script tags
    if (html.includes('openapi') || html.includes('swagger')) {
      this.detectedSchemaType = 'openapi';
      return true;
    }

    // Check for sitemap references
    if (html.includes('sitemap.xml') || html.includes('<link rel="sitemap"')) {
      this.detectedSchemaType = 'sitemap';
      return true;
    }

    return false;
  }

  async parse(html: string, url: string): Promise<ParseResult> {
    const warnings: string[] = [];
    let nodes: ExtractedNode[] = [];
    let edges: ExtractedEdge[] = [];

    // Detect schema type within parse method
    const hasOpenAPI = html.includes('openapi') || html.includes('swagger');
    const hasSitemap = html.includes('sitemap.xml') || html.includes('<link rel="sitemap"');

    if (hasOpenAPI) {
      const result = this.parseOpenAPI(html);
      nodes = result.nodes;
      edges = result.edges;
      if (nodes.length === 0) {
        warnings.push('OpenAPI schema detected but no endpoints extracted');
      }
    } else if (hasSitemap) {
      const result = this.parseSitemap(html);
      nodes = result.nodes;
      edges = result.edges;
      if (nodes.length === 0) {
        warnings.push('Sitemap reference detected but no URLs extracted');
      }
    }

    // Calculate confidence based on completeness
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
    // Base confidence, adjusted by calculateConfidence based on results
    return 0.8;
  }

  // =====================================================
  // OPENAPI PARSING
  // =====================================================

  private parseOpenAPI(html: string): { nodes: ExtractedNode[]; edges: ExtractedEdge[] } {
    const nodes: ExtractedNode[] = [];
    const edges: ExtractedEdge[] = [];

    try {
      // Look for OpenAPI JSON in script tags
      const doc = cheerio.load(html);
      let openApiSpec: any = null;

      // Try to find OpenAPI spec in script tags
      doc('script[type="application/json"]').each((_, elem) => {
        const content = doc(elem).html();
        if (content && (content.includes('openapi') || content.includes('swagger'))) {
          try {
            // Decode HTML entities that Cheerio might have encoded
            const decoded = content
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>');
            openApiSpec = JSON.parse(decoded);
          } catch {
            // Invalid JSON, skip
          }
        }
      });

      if (!openApiSpec) {
        return { nodes, edges };
      }

      // Extract API info as product
      if (openApiSpec.info?.title) {
        const productId = generateNodeId(openApiSpec.info.title, 'product');
        nodes.push({
          id: productId,
          type: 'product',
          data: {
            label: sanitizeText(openApiSpec.info.title),
            description: truncateDescription(openApiSpec.info.description || '', 200),
          },
          level: 1,
        });
      }

      // Extract tags as features
      const tagMap = new Map<string, string>();
      if (openApiSpec.tags && Array.isArray(openApiSpec.tags)) {
        openApiSpec.tags.forEach((tag: any) => {
          if (tag.name) {
            const featureId = generateNodeId(tag.name, 'feature');
            tagMap.set(tag.name, featureId);
            nodes.push({
              id: featureId,
              type: 'feature',
              data: {
                label: sanitizeText(tag.name),
                description: truncateDescription(tag.description || '', 200),
              },
              level: 2,
            });

            // Create hierarchy edge to product
            if (nodes.length > 0 && nodes[0].type === 'product') {
              edges.push({
                id: `${nodes[0].id}-${featureId}`,
                source: nodes[0].id,
                target: featureId,
                type: 'hierarchy',
                confidence: 0.9,
                inferenceMethod: 'explicit',
              });
            }
          }
        });
      }

      // Extract paths as components
      if (openApiSpec.paths) {
        Object.entries(openApiSpec.paths).forEach(([path, methods]: [string, any]) => {
          // Get first method to extract info
          const methodKeys = Object.keys(methods).filter(k => 
            ['get', 'post', 'put', 'delete', 'patch'].includes(k)
          );
          
          if (methodKeys.length > 0) {
            const method = methods[methodKeys[0]];
            const label = method.summary || method.operationId || path;
            
            if (label.length >= 3) {
              const componentId = generateNodeId(label, 'component');
              nodes.push({
                id: componentId,
                type: 'component',
                data: {
                  label: sanitizeText(label),
                  description: truncateDescription(method.description || path, 200),
                  docUrl: path,
                },
                level: 3,
              });

              // Link to tag/feature if available
              if (method.tags && method.tags.length > 0) {
                const tagId = tagMap.get(method.tags[0]);
                if (tagId) {
                  edges.push({
                    id: `${tagId}-${componentId}`,
                    source: tagId,
                    target: componentId,
                    type: 'hierarchy',
                    confidence: 0.9,
                    inferenceMethod: 'explicit',
                  });
                }
              }
            }
          }
        });
      }
    } catch (error) {
      // Parsing failed, return empty results
    }

    return { nodes, edges };
  }

  // =====================================================
  // SITEMAP PARSING
  // =====================================================

  private parseSitemap(html: string): { nodes: ExtractedNode[]; edges: ExtractedEdge[] } {
    const nodes: ExtractedNode[] = [];
    const edges: ExtractedEdge[] = [];

    try {
      const doc = cheerio.load(html);

      // Look for sitemap link
      const sitemapUrl = doc('link[rel="sitemap"]').attr('href');
      if (!sitemapUrl) {
        return { nodes, edges };
      }

      // Note: In a real implementation, we would fetch and parse the sitemap.xml
      // For now, we'll extract URLs from the current page that look like documentation
      doc('a[href]').each((_, elem) => {
        const href = doc(elem).attr('href');
        const text = sanitizeText(doc(elem).text());
        
        if (href && text && text.length >= 3 && text.length <= 100) {
          // Infer type from URL structure
          const segments = href.split('/').filter(s => s.length > 0);
          let type: 'product' | 'feature' | 'component' = 'component';
          let level = 3;
          
          if (segments.length === 1) {
            type = 'product';
            level = 1;
          } else if (segments.length === 2) {
            type = 'feature';
            level = 2;
          }

          const nodeId = generateNodeId(text, type);
          
          // Avoid duplicates
          if (!nodes.find(n => n.id === nodeId)) {
            nodes.push({
              id: nodeId,
              type,
              data: {
                label: text,
                docUrl: href,
              },
              level,
            });
          }
        }
      });

      // Create hierarchy edges based on levels
      const products = nodes.filter(n => n.type === 'product');
      const features = nodes.filter(n => n.type === 'feature');
      const components = nodes.filter(n => n.type === 'component');

      if (products.length > 0) {
        features.forEach(feature => {
          edges.push({
            id: `${products[0].id}-${feature.id}`,
            source: products[0].id,
            target: feature.id,
            type: 'hierarchy',
            confidence: 0.7,
            inferenceMethod: 'hierarchy',
          });
        });

        if (features.length > 0) {
          components.forEach(component => {
            edges.push({
              id: `${features[0].id}-${component.id}`,
              source: features[0].id,
              target: component.id,
              type: 'hierarchy',
              confidence: 0.6,
              inferenceMethod: 'hierarchy',
            });
          });
        }
      }
    } catch (error) {
      // Parsing failed, return empty results
    }

    return { nodes, edges };
  }

  // =====================================================
  // CONFIDENCE CALCULATION
  // =====================================================

  private calculateConfidence(nodes: ExtractedNode[], edges: ExtractedEdge[]): number {
    if (nodes.length === 0) {
      return 0.3;
    }

    // Base confidence
    let confidence = 0.7;

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

    return Math.min(confidence, 0.9);
  }
}
