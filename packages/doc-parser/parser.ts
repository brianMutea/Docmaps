// Parser orchestrator - coordinates all parsing strategies and validators

import { TemplateStrategy } from './strategies/template';
import { SchemaStrategy } from './strategies/schema';
import { HtmlStrategy } from './strategies/html';
import { HeuristicStrategy } from './strategies/heuristic';
import { deepCrawl } from './strategies/deep-crawl';
import { parseHybrid } from './strategies/hybrid';
import { parseFromNavigation } from './strategies/navigation';
import { fetchWithBrowser } from './fetcher';
import { deduplicateNodes, updateEdgeReferences } from './validators/deduplication';
import { filterNodes } from './validators/filtering';
import { sanitizeNodes } from './validators/sanitization';
import type { ParseResult, ParsingStrategy } from './types';

/**
 * Parse documentation from HTML using multiple strategies
 * @param html - Raw HTML content
 * @param url - Source URL
 * @param enableDeepCrawl - Whether to enable multi-page crawling (default: true)
 * @returns Parse result with nodes, edges, and metadata
 */
export async function parseDocumentation(
  html: string, 
  url: string,
  enableDeepCrawl: boolean = true
): Promise<ParseResult> {
  const startTime = Date.now();
  const generatedAt = new Date().toISOString();

  // Try deep crawl first if enabled (best quality, fetches multiple pages)
  if (enableDeepCrawl) {
    try {
      console.log('[Parser] Attempting deep crawl strategy...');
      const deepCrawlStartTime = Date.now();
      
      // Add a timeout wrapper for deep crawl (max 120 seconds)
      const deepCrawlPromise = deepCrawl(fetchWithBrowser, url, 5);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Deep crawl timeout after 120 seconds')), 120000)
      );
      
      const deepResult = await Promise.race([deepCrawlPromise, timeoutPromise]);
      const deepCrawlDuration = Date.now() - deepCrawlStartTime;
      
      console.log(`[Parser] Deep crawl completed in ${deepCrawlDuration}ms: ${deepResult.nodes.length} nodes from ${deepResult.pagesCrawled} pages, confidence: ${deepResult.confidence}`);
      
      if (deepResult.nodes.length >= 5 && deepResult.confidence >= 0.7) {
        console.log(`[Parser] Deep crawl succeeded: ${deepResult.nodes.length} nodes from ${deepResult.pagesCrawled} pages`);
        
        const result: ParseResult = {
          nodes: deepResult.nodes,
          edges: deepResult.edges,
          metadata: {
            source_url: url,
            generated_at: generatedAt,
            strategy: 'deep-crawl',
            confidence: deepResult.confidence,
            warnings: [],
            stats: {
              nodes_extracted: deepResult.nodes.length,
              nodes_final: deepResult.nodes.length,
              edges_extracted: deepResult.edges.length,
              nodes_deduplicated: 0,
              nodes_filtered: 0,
              duration_ms: 0,
            },
          },
        };

        // Apply validators
        const originalNodeCount = result.nodes.length;
        const originalEdgeCount = result.edges.length;

        const { nodes: deduplicatedNodes, idMapping } = deduplicateNodes(result.nodes);
        const deduplicatedEdges = updateEdgeReferences(result.edges, idMapping);
        const deduplicationCount = originalNodeCount - deduplicatedNodes.length;

        const filteredNodes = filterNodes(deduplicatedNodes);
        const filteringCount = deduplicatedNodes.length - filteredNodes.length;

        const sanitizedNodes = sanitizeNodes(filteredNodes);

        const duration = Date.now() - startTime;

        return {
          nodes: sanitizedNodes,
          edges: deduplicatedEdges,
          metadata: {
            ...result.metadata,
            stats: {
              nodes_extracted: originalNodeCount,
              nodes_final: sanitizedNodes.length,
              edges_extracted: originalEdgeCount,
              nodes_deduplicated: deduplicationCount,
              nodes_filtered: filteringCount,
              duration_ms: duration,
            },
          },
        };
      }
    } catch (error) {
      console.error('[Parser] Deep crawl failed:', error instanceof Error ? error.message : error);
      console.log('[Parser] Falling back to other strategies...');
      // Fall through to other strategies
    }
  }

  // Try hybrid strategy (single page, content + navigation)
  const hybridResult = parseHybrid(html, url);
  if (hybridResult.nodes.length >= 3 && hybridResult.confidence >= 0.5) {
    const result: ParseResult = {
      nodes: hybridResult.nodes,
      edges: hybridResult.edges,
      metadata: {
        source_url: url,
        generated_at: generatedAt,
        strategy: 'hybrid',
        confidence: hybridResult.confidence,
        warnings: [],
        stats: {
          nodes_extracted: hybridResult.nodes.length,
          nodes_final: hybridResult.nodes.length,
          edges_extracted: hybridResult.edges.length,
          nodes_deduplicated: 0,
          nodes_filtered: 0,
          duration_ms: 0,
        },
      },
    };

    // Apply validators
    const originalNodeCount = result.nodes.length;
    const originalEdgeCount = result.edges.length;

    const { nodes: deduplicatedNodes, idMapping } = deduplicateNodes(result.nodes);
    const deduplicatedEdges = updateEdgeReferences(result.edges, idMapping);
    const deduplicationCount = originalNodeCount - deduplicatedNodes.length;

    const filteredNodes = filterNodes(deduplicatedNodes);
    const filteringCount = deduplicatedNodes.length - filteredNodes.length;

    const sanitizedNodes = sanitizeNodes(filteredNodes);

    const duration = Date.now() - startTime;

    return {
      nodes: sanitizedNodes,
      edges: deduplicatedEdges,
      metadata: {
        ...result.metadata,
        stats: {
          nodes_extracted: originalNodeCount,
          nodes_final: sanitizedNodes.length,
          edges_extracted: originalEdgeCount,
          nodes_deduplicated: deduplicationCount,
          nodes_filtered: filteringCount,
          duration_ms: duration,
        },
      },
    };
  }

  // Try navigation-based parsing as fallback
  const navResult = parseFromNavigation(html, url);
  if (navResult.nodes.length >= 3 && navResult.confidence >= 0.5) {
    // Navigation parsing succeeded, use it
    const result: ParseResult = {
      nodes: navResult.nodes,
      edges: navResult.edges,
      metadata: {
        source_url: url,
        generated_at: generatedAt,
        strategy: 'navigation',
        confidence: navResult.confidence,
        warnings: [],
        stats: {
          nodes_extracted: navResult.nodes.length,
          nodes_final: navResult.nodes.length,
          edges_extracted: navResult.edges.length,
          nodes_deduplicated: 0,
          nodes_filtered: 0,
          duration_ms: 0,
        },
      },
    };

    // Apply validators
    const originalNodeCount = result.nodes.length;
    const originalEdgeCount = result.edges.length;

    const { nodes: deduplicatedNodes, idMapping } = deduplicateNodes(result.nodes);
    const deduplicatedEdges = updateEdgeReferences(result.edges, idMapping);
    const deduplicationCount = originalNodeCount - deduplicatedNodes.length;

    const filteredNodes = filterNodes(deduplicatedNodes);
    const filteringCount = deduplicatedNodes.length - filteredNodes.length;

    const sanitizedNodes = sanitizeNodes(filteredNodes);

    const duration = Date.now() - startTime;

    return {
      nodes: sanitizedNodes,
      edges: deduplicatedEdges,
      metadata: {
        ...result.metadata,
        stats: {
          nodes_extracted: originalNodeCount,
          nodes_final: sanitizedNodes.length,
          edges_extracted: originalEdgeCount,
          nodes_deduplicated: deduplicationCount,
          nodes_filtered: filteringCount,
          duration_ms: duration,
        },
      },
    };
  }

  // Initialize all strategies in priority order (fallback)
  const strategies: ParsingStrategy[] = [
    new TemplateStrategy(),   // Highest confidence (0.9)
    new SchemaStrategy(),      // High confidence (0.7-0.9)
    new HtmlStrategy(),        // Medium confidence (0.5-0.7)
    new HeuristicStrategy(),   // Lowest confidence (0.3-0.5)
  ];

  let result: ParseResult | null = null;
  let selectedStrategy: string | null = null;

  // Try each strategy in order
  for (const strategy of strategies) {
    if (strategy.canHandle(html, url)) {
      try {
        const parseResult = await strategy.parse(html, url);

        // Accept result if confidence is above threshold
        if (parseResult.metadata.confidence >= 0.3) {
          result = parseResult;
          selectedStrategy = strategy.name;
          break;
        }
      } catch (error) {
        // Strategy failed, try next one
        continue;
      }
    }
  }

  // If no strategy succeeded, use heuristic as fallback
  if (!result) {
    const heuristic = new HeuristicStrategy();
    result = await heuristic.parse(html, url);
    selectedStrategy = heuristic.name;
  }

  // Track original counts
  const originalNodeCount = result.nodes.length;
  const originalEdgeCount = result.edges.length;

  // Apply validators in sequence
  
  // 1. Deduplication
  const { nodes: deduplicatedNodes, idMapping } = deduplicateNodes(result.nodes);
  const deduplicatedEdges = updateEdgeReferences(result.edges, idMapping);
  const deduplicationCount = originalNodeCount - deduplicatedNodes.length;

  // 2. Filtering
  const filteredNodes = filterNodes(deduplicatedNodes);
  const filteringCount = deduplicatedNodes.length - filteredNodes.length;

  // 3. Sanitization
  const sanitizedNodes = sanitizeNodes(filteredNodes);

  // Calculate duration
  const duration = Date.now() - startTime;

  // Return final result with updated metadata
  return {
    nodes: sanitizedNodes,
    edges: deduplicatedEdges,
    metadata: {
      ...result.metadata,
      strategy: selectedStrategy || 'unknown',
      stats: {
        nodes_extracted: originalNodeCount,
        nodes_final: sanitizedNodes.length,
        edges_extracted: originalEdgeCount,
        nodes_deduplicated: deduplicationCount,
        nodes_filtered: filteringCount,
        duration_ms: duration,
      },
    },
  };
}

/**
 * Get available parsing strategies
 * @returns Array of strategy names
 */
export function getAvailableStrategies(): string[] {
  return ['deep-crawl', 'hybrid', 'navigation', 'template', 'schema', 'html', 'heuristic'];
}

/**
 * Test which strategy would be used for given HTML/URL
 * @param html - Raw HTML content
 * @param url - Source URL
 * @returns Strategy name that would be used
 */
export function detectStrategy(html: string, url: string): string {
  // Check hybrid first
  const hybridResult = parseHybrid(html, url);
  if (hybridResult.nodes.length >= 3 && hybridResult.confidence >= 0.5) {
    return 'hybrid';
  }

  // Check navigation
  const navResult = parseFromNavigation(html, url);
  if (navResult.nodes.length >= 3 && navResult.confidence >= 0.5) {
    return 'navigation';
  }

  const strategies: ParsingStrategy[] = [
    new TemplateStrategy(),
    new SchemaStrategy(),
    new HtmlStrategy(),
    new HeuristicStrategy(),
  ];

  for (const strategy of strategies) {
    if (strategy.canHandle(html, url)) {
      return strategy.name;
    }
  }

  return 'heuristic'; // Fallback
}
