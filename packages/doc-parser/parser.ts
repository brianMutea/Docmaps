// Parser orchestrator - coordinates all parsing strategies and validators

import { TemplateStrategy } from './strategies/template';
import { SchemaStrategy } from './strategies/schema';
import { HtmlStrategy } from './strategies/html';
import { HeuristicStrategy } from './strategies/heuristic';
import { deduplicateNodes, updateEdgeReferences } from './validators/deduplication';
import { filterNodes } from './validators/filtering';
import { sanitizeNodes } from './validators/sanitization';
import type { ParseResult, ParsingStrategy } from './types';

/**
 * Parse documentation from HTML using multiple strategies
 * @param html - Raw HTML content
 * @param url - Source URL
 * @returns Parse result with nodes, edges, and metadata
 */
export async function parseDocumentation(html: string, url: string): Promise<ParseResult> {
  const startTime = Date.now();

  // Initialize all strategies in priority order
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
  return ['template', 'schema', 'html', 'heuristic'];
}

/**
 * Test which strategy would be used for given HTML/URL
 * @param html - Raw HTML content
 * @param url - Source URL
 * @returns Strategy name that would be used
 */
export function detectStrategy(html: string, url: string): string {
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
