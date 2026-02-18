// Main exports for doc-parser package

// Core parser
export { parseDocumentation, getAvailableStrategies, detectStrategy } from './parser';

// Fetcher
export { fetchDocumentation, validateUrl } from './fetcher';

// Cache
export { getCached, setCached, clearCache, getCacheSize, isCached } from './cache';

// Utilities
export {
  generateNodeId,
  sanitizeText,
  truncateDescription,
  isValidUrl,
  hashUrl,
  sleep,
} from './utils';

// Validators
export { deduplicateNodes, updateEdgeReferences } from './validators/deduplication';
export { filterNodes, getFilterStats } from './validators/filtering';
export { sanitizeNodes, sanitizeNode, removeDangerousContent, isNodeSafe } from './validators/sanitization';

// Strategies
export { TemplateStrategy } from './strategies/template';
export { SchemaStrategy } from './strategies/schema';
export { HtmlStrategy } from './strategies/html';
export { HeuristicStrategy } from './strategies/heuristic';
export { BaseStrategy } from './strategies/base';

// Types
export type {
  FetchResult,
  ParseResult,
  ParsingStrategy,
  ExtractedNode,
  ExtractedEdge,
  GenerationMetadata,
  GenerationErrorCode,
  GenerationError,
  SSEEventType,
  SSEEvent,
} from './types';
